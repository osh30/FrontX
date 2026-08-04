import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FileText, Eye, Heart, MessageCircle, Trash2, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
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

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/blogs`);
      setBlogs(res.data.blogs || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog permanently?')) return;
    try {
      await axios.delete(`${API_URL}/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-8">
        <SectionHeading
          subtitle={`${blogs.length} articles · Review and manage content`}
          delay={0}
          right={
            <button onClick={fetchBlogs} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          }
        >
          Blog Management
        </SectionHeading>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No blogs yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {blogs.map((blog, i) => (
              <motion.div key={blog._id} variants={fadeUp} custom={i} className="relative overflow-hidden rounded-2xl p-[1px]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07]" />
                <div className="relative rounded-[calc(1rem-1px)] p-5" style={{
                  background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
                }}>
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
                    <div className="absolute inset-0 opacity-[0.02]"
                      style={{
                        background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
                        backgroundSize: '250% 100%',
                        animation: 'shimmerSweep 8s ease-in-out infinite',
                      }} />
                  </div>
                  <div className="relative z-10">
                    {blog.coverImage && <img src={blog.coverImage} alt="" className="w-full h-32 object-cover rounded-xl mb-3 border border-white/[0.06]" />}
                    <h3 className="text-[13px] font-bold text-white line-clamp-2">{blog.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{blog.summary}</p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {blog.commentCount}</span>
                      <span className="ml-auto px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/10 font-medium">{blog.category}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                      <span className="text-[10px] text-slate-500">{blog.author?.name || 'Unknown'}</span>
                      <button onClick={() => handleDelete(blog._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes shimmerSweep { 0%, 100% { background-position: -250% 0; } 50% { background-position: 250% 0; } }`}</style>
    </motion.div>
  );
};

export default AdminBlogs;
