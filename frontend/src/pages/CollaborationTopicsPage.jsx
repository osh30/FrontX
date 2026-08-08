import { API_BASE } from '../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Microscope, Clock, Users, ChevronRight } from 'lucide-react';
import Avatar from '../component/dashboard/Avatar';

const CollaborationTopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/collaboration`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
        }
      } catch (err) {
        console.error("Failed to fetch collaboration posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navbar */}
      <header className="h-20 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center px-6 lg:px-10 z-20 sticky top-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard"
              className="p-2.5 bg-white/80 border border-gray-100 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Collaboration Portal</h1>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 shadow-sm mb-4">
            <Microscope className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore Research Topics</h2>
          <p className="text-gray-600">Collaborate with experienced mentors and alumni on academic and industrial research projects to boost your portfolio.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 max-w-2xl mx-auto shadow-sm">
            <Microscope className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-900 mb-2">No collaboration opportunities available yet.</p>
            <p className="text-sm text-gray-500">Collaboration opportunities posted by alumni will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic, idx) => (
              <motion.div 
                key={topic._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 uppercase tracking-wide">
                      {topic.type || 'Research'}
                    </div>
                    {topic.createdAt && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(topic.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight">{topic.title}</h3>
                  <p className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                    <Avatar src={topic.alumni?.profilePicture} alt={topic.alumni?.name} size={24} />
                    {topic.alumni?.name || 'Alumni Mentor'}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                    {topic.overview || topic.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                    {topic.requiredSkills?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                        {skill}
                      </span>
                    ))}
                    {topic.requiredSkills?.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                        +{topic.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>{topic.applicantCount || 0} Interested</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{topic.duration || 'Flexible'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/dashboard/collaboration/${topic._id}`)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborationTopicsPage;
