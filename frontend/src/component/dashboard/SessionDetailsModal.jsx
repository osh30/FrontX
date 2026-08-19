import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, Link as LinkIcon, Target, FileText, CheckCircle, Award } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { joinSessionMeeting, openMeeting, meetingPlatformLabel, canJoinSession, canJoinInTimeWindow, sessionJoinState } from '../../meeting/lib/sessionJoin';
import { useMeetingClock } from '../../meeting/hooks/useMeetingClock';

export const SessionDetailsModal = ({ isOpen, onClose, session }) => {
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const meetingNow = useMeetingClock();

  const handleJoin = async () => {
    setJoining(true);
    try {
      const data = await joinSessionMeeting(session._id);
      openMeeting(data, navigate);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to open meeting. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md lg:pl-64">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`px-3 py-1 text-xs font-bold rounded-lg border ${
              session.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
              session.status === 'Scheduled' ? 'bg-purple-50 text-purple-700 border-purple-100' :
              'bg-gray-50 text-gray-700 border-gray-100'
            }`}>
              {session.status}
            </div>
            <span className="text-sm font-medium text-gray-500">{session.type}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">{session.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <Avatar src={session.alumni?.profilePicture} alt={session.alumni?.name} size={40} className="border-2 border-white shadow-sm" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">Mentor</p>
                <p className="text-sm font-bold text-gray-900">{session.alumni?.name}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <Avatar src={session.student?.profilePicture} alt={session.student?.name} size={40} className="border-2 border-white shadow-sm" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">Student</p>
                <p className="text-sm font-bold text-gray-900">{session.student?.name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold mb-1">DATE</p>
                <p className="text-sm font-medium text-gray-900">{new Date(session.date).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold mb-1">TIME</p>
                <p className="text-sm font-medium text-gray-900">{session.time}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold mb-1">DURATION</p>
                <p className="text-sm font-medium text-gray-900">{session.duration} mins</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Video className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold mb-1">PLATFORM</p>
                <p className="text-sm font-medium text-gray-900">{meetingPlatformLabel(session)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-purple-500"/> Goal</p>
              <p className="text-sm text-gray-600 bg-purple-50 p-4 rounded-xl">{session.goal}</p>
            </div>

            {session.notes && (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/> Notes</p>
                <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">{session.notes}</p>
              </div>
            )}

            {(session.status === 'Scheduled' || session.status === 'Upcoming' || session.status === 'Ongoing' || session.status === 'Active') && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleJoin}
                  disabled={joining || (session.meetingType === 'frontx' && !canJoinSession(session, meetingNow))}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors shadow-md disabled:opacity-60"
                >
                  <LinkIcon className="w-4 h-4" /> {joining ? 'Opening…' : (session.meetingType === 'frontx' ? (sessionJoinState(session, meetingNow).label || 'Join Meeting') : 'Open')}
                </button>
              </div>
            )}

            {session.status === 'Completed' && session.feedbackStrengths && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" /> Session Feedback
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Strengths</p>
                    <p className="text-sm text-gray-700">{session.feedbackStrengths}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">Areas for Improvement</p>
                    <p className="text-sm text-gray-700">{session.feedbackImprovement}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Next Steps</p>
                    <p className="text-sm text-gray-700">{session.feedbackNextSteps}</p>
                  </div>
                  {session.feedbackResources && (
                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Recommended Resources</p>
                      <p className="text-sm text-gray-700">{session.feedbackResources}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
