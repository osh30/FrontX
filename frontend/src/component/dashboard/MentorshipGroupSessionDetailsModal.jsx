import { API_BASE } from '../../config/api';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, Users, List, FileText, CheckCircle, Ban } from 'lucide-react';
import Avatar from './Avatar';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { joinMentorshipMeeting, openMeeting, meetingPlatformLabel } from '../../meeting/lib/sessionJoin';

export const MentorshipGroupSessionDetailsModal = ({ isOpen, onClose, session, isAlumni, onRefresh }) => {
  if (!isOpen || !session) return null;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [outcome, setOutcome] = useState(session.outcome || '');
  const [attendance, setAttendance] = useState(session.attendance || []);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const data = await joinMentorshipMeeting(session._id);
      openMeeting(data, navigate);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to open meeting. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleCancelSession = async () => {
    if (!window.confirm('Are you sure you want to cancel this session? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/mentorship-sessions/${session._id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Session cancelled');
        onRefresh && onRefresh();
        onClose();
      } else {
        toast.error('Failed to cancel session');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error cancelling session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOutcome = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/mentorship-sessions/${session._id}/outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ outcome, attendance })
      });
      
      if (res.ok) {
        toast.success('Outcome and attendance saved!');
        onRefresh && onRefresh();
        onClose();
      } else {
        toast.error('Failed to save outcome');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving outcome');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId, status) => {
    setAttendance(prev => 
      prev.map(a => 
        a.studentId?._id === studentId ? { ...a, status } : a
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => onClose()}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 p-6 text-white relative flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative z-10 pr-8">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-white/20 backdrop-blur-md`}>
                {session.status}
              </span>
              <span className="text-purple-100 text-sm font-medium">{session.sessionCategory}</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">{session.sessionTitle}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'details' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Session Details
          </button>
          {session.status === 'Completed' && isAlumni && (
            <button 
              onClick={() => setActiveTab('outcome')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'outcome' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Outcome & Attendance
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Date</p>
                    <p className="font-bold text-gray-900">{new Date(session.sessionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Time</p>
                    <p className="font-bold text-gray-900">{session.sessionTime} ({session.sessionDuration}m)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Platform</p>
                    <p className="font-bold text-gray-900">{meetingPlatformLabel(session)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Students</p>
                    <p className="font-bold text-gray-900">{session.selectedStudents?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" /> Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                  {session.sessionDescription}
                </p>
              </div>

              {session.agenda && session.agenda.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <List className="w-4 h-4 text-purple-600" /> Agenda
                  </h3>
                  <ul className="space-y-2 bg-gray-50 p-4 rounded-xl">
                    {session.agenda.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-purple-600 font-bold">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" /> Participants
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {session.selectedStudents?.map(student => (
                    <div key={student._id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <Avatar src={student.profilePicture} alt={student.name} size={40} className="border-2 border-white shadow-sm" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.department || 'Student'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4 border border-blue-100">
                Mark attendance and summarize the session outcome. This helps track student progress.
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Attendance</h3>
                <div className="space-y-2">
                  {attendance.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Avatar src={att.studentId?.profilePicture} alt={att.studentId?.name} size={40} className="border-2 border-white shadow-sm" />
                        <span className="font-semibold text-sm text-gray-900">{att.studentId?.name || 'Student'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleAttendance(att.studentId?._id, 'Present')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${att.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-white border text-gray-500'}`}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => toggleAttendance(att.studentId?._id, 'Absent')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${att.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-white border text-gray-500'}`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Session Outcome & Notes</h3>
                <textarea 
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What was discussed? Action items? Feedback?"
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white resize-none"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          {activeTab === 'details' ? (
            <>
              {session.status === 'Upcoming' && isAlumni && (
                <button 
                  onClick={handleCancelSession}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" /> Cancel Session
                </button>
              )}
              {session.status === 'Upcoming' && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <Video className="w-4 h-4" /> {joining ? 'Opening…' : 'Join Meeting'}
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={handleSubmitOutcome}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Save Outcome</>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
