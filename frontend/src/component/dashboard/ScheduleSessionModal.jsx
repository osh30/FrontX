import { API_BASE } from '../../config/api';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, Link as LinkIcon, Target, FileText, Sparkles } from 'lucide-react';
import { MeetingTypeSelector } from './MeetingTypeSelector';

export const ScheduleSessionModal = ({ isOpen, onClose, studentId, studentName, onSchedule }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Mentorship Session',
    date: '',
    time: '',
    duration: 60,
    meetingType: 'external',
    platform: 'Google Meet',
    meetingLink: '',
    goal: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, studentId })
      });
      if (res.ok) {
        const session = await res.json();
        onSchedule(session);
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Session</h2>
          <p className="text-gray-500 mb-6">Schedule a meeting with {studentName}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g., Initial Mentorship Meetup"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session Type *</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {['Mentorship Session', 'Career Guidance', 'Research Discussion', 'Mock Interview', 'Portfolio Review', 'Resume Review', 'Scholarship Guidance', 'Custom'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date *</label>
                <input 
                  required
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Clock className="w-4 h-4"/> Time *</label>
                <input 
                  required
                  type="time" 
                  value={formData.time} 
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">Duration (mins) *</label>
                <input 
                  required
                  type="number" 
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <MeetingTypeSelector
              value={formData.meetingType}
              onChange={(meetingType) => setFormData({ ...formData, meetingType })}
              accent="purple"
            />

            <AnimatePresence initial={false}>
              {formData.meetingType === 'frontx' ? (
                <motion.div
                  key="frontx-info"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-purple-700">FrontX Live Meeting</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        A secure FrontX video room will be created automatically when this session is scheduled. You and {studentName} can join it instantly from the app — no external link needed.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="external-fields"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Video className="w-4 h-4"/> Platform *</label>
                      <select 
                        value={formData.platform}
                        onChange={(e) => setFormData({...formData, platform: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        {['Google Meet', 'Zoom', 'Microsoft Teams', 'Other'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Meeting Link *</label>
                      <input 
                        required={formData.meetingType === 'external'}
                        type="url" 
                        value={formData.meetingLink} 
                        onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Target className="w-4 h-4"/> Session Goal *</label>
              <input 
                required
                type="text" 
                value={formData.goal} 
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., Discuss career roadmap and review resume"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Additional Notes</label>
              <textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                placeholder="Any preparation needed by the student?"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-gray-900 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all shadow-md"
              >
                {loading ? 'Scheduling...' : 'Schedule Session'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
