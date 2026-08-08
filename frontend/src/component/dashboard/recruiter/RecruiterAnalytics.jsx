import { API_BASE } from '../../../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BarChart3, Briefcase, Users, Calendar } from 'lucide-react';

const API_URL = API_BASE;

const RecruiterAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/recruiter/analytics`);
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const s = analytics?.stats || {};
  const cards = [
    { label: 'Total Opportunities', value: s.totalOpportunities || 0, icon: Briefcase, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Total Applicants', value: s.totalApplications || 0, icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Upcoming Interviews', value: s.upcomingInterviews || 0, icon: Calendar, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { label: 'Completed Interviews', value: s.completedInterviews || 0, icon: BarChart3, bg: 'bg-pink-50', color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Track your recruitment performance.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Top Opportunities */}
      {analytics?.topOpportunities?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Top Performing Opportunities</h3>
          <div className="space-y-3">
            {analytics.topOpportunities.map((opp, idx) => (
              <div key={opp._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{opp.title}</p>
                  <p className="text-xs text-gray-400">{opp.applicationCount || 0} applications</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${opp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {opp.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecruiterAnalytics;
