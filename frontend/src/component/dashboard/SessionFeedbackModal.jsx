
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, TrendingUp, ArrowRight, BookOpen } from 'lucide-react';

export const SessionFeedbackModal = ({ isOpen, onClose, session, onComplete }) => {
  const [formData, setFormData] = useState({
    strengths: '',
    improvement: '',
    nextSteps: '',
    resources: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/sessions/${session._id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updatedSession = await res.json();
        onComplete(updatedSession);
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session) return null;

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

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Session</h2>
          </div>
          <p className="text-gray-500 mb-8 pl-13">Provide constructive feedback for {session.student?.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500"/> Strengths (Required)
              </label>
              <textarea 
                required
                value={formData.strengths} 
                onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                placeholder="What did the student do well?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500"/> Areas for Improvement (Required)
              </label>
              <textarea 
                required
                value={formData.improvement} 
                onChange={(e) => setFormData({...formData, improvement: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none"
                placeholder="What should they focus on improving?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500"/> Next Steps (Required)
              </label>
              <textarea 
                required
                value={formData.nextSteps} 
                onChange={(e) => setFormData({...formData, nextSteps: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="What action items should they complete before the next session?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500"/> Recommended Resources
              </label>
              <textarea 
                value={formData.resources} 
                onChange={(e) => setFormData({...formData, resources: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                placeholder="Links to articles, courses, or tools"
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
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md"
              >
                {loading ? 'Saving...' : 'Submit Feedback & Complete'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
