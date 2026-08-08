import { API_BASE } from '../../../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Star, Calendar, Mail, GraduationCap } from 'lucide-react';

const API_URL = API_BASE;

const Shortlisted = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShortlisted(); }, []);

  const fetchShortlisted = async () => {
    try {
      const res = await axios.get(`${API_URL}/recruiter/shortlisted`);
      setCandidates(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Shortlisted Candidates</h2>
        <p className="text-sm text-gray-500 mt-1">Candidates you've shortlisted for further evaluation.</p>
      </motion.div>

      <div className="space-y-3">
        {loading ? [1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />) :
          candidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No shortlisted candidates yet</p>
              <p className="text-sm text-gray-500 mt-1">Shortlist applicants from the Applicants tab</p>
            </div>
          ) : candidates.map((app, idx) => (
            <motion.div key={app._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">
                    {app.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{app.student?.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.student?.email}</span>
                    {app.student?.department && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {app.student?.department}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-amber-600">{app.opportunity?.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Shortlisted {new Date(app.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        }
      </div>
    </div>
  );
};

export default Shortlisted;
