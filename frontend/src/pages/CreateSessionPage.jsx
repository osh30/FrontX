import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, Video, Users, ListPlus, Send, X, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../component/dashboard/Avatar';
import { MeetingTypeSelector } from '../component/dashboard/MeetingTypeSelector';

const CreateSessionPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    sessionTitle: '',
    sessionCategory: 'Career Guidance',
    sessionDescription: '',
    meetingType: 'external',
    meetingPlatform: 'Google Meet',
    meetingLink: '',
    sessionDate: '',
    sessionTime: '',
    sessionDuration: 60
  });

  const [agendaItems, setAgendaItems] = useState(['']);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        
        const res = await fetch(`${API_BASE}/mentorship-sessions/accepted-students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setAvailableStudents(data);
        }
      } catch (error) {
        console.error('Failed to fetch students', error);
      }
    };
    fetchStudents();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAgendaChange = (index, value) => {
    const newAgenda = [...agendaItems];
    newAgenda[index] = value;
    setAgendaItems(newAgenda);
  };

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']);
  };

  const removeAgendaItem = (index) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const toggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student.');
      return;
    }
    
    // Filter out empty agenda items
    const cleanAgenda = agendaItems.filter(item => item.trim() !== '');

    // Basic URL validation (only for external meetings)
    if (formData.meetingType === 'external') {
      const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

      if(!urlPattern.test(formData.meetingLink)) {
        toast.error('Please provide a valid meeting link URL.');
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/mentorship-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          selectedStudents,
          agenda: cleanAgenda
        })
      });

      if (res.ok) {
        toast.success('Session created successfully!');
        navigate('/dashboard/mentorship-sessions');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to create session');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard/alumni')} 
          className="flex items-center text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h1 className="text-3xl font-bold mb-2 relative z-10">Create Mentorship Session</h1>
            <p className="text-purple-100 relative z-10">Schedule and organize mentorship sessions with selected students.</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Session Title</label>
                  <input 
                    type="text" 
                    name="sessionTitle"
                    required
                    value={formData.sessionTitle}
                    onChange={handleChange}
                    placeholder="e.g. CV Review Session"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Session Category</label>
                  <select 
                    name="sessionCategory"
                    value={formData.sessionCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                  >
                    <option>Career Guidance</option>
                    <option>CV Review</option>
                    <option>Interview Preparation</option>
                    <option>Research Discussion</option>
                    <option>Industry Insights</option>
                    <option>Project Review</option>
                    <option>Scholarship Guidance</option>
                    <option>Graduate Study Guidance</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session Description</label>
                <textarea 
                  name="sessionDescription"
                  required
                  rows="4"
                  value={formData.sessionDescription}
                  onChange={handleChange}
                  placeholder="Describe what the session is about, what students will learn, expected outcomes, and preparation requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-2 text-right">Minimum 50 characters recommended.</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Section 2: Students */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Select Students</h3>
              </div>
              
              {availableStudents.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">You don't have any accepted students yet. Go to your dashboard and accept mentorship requests first.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {availableStudents.map(student => (
                    <div 
                      key={student._id}
                      onClick={() => toggleStudent(student._id)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedStudents.includes(student._id) ? 'bg-purple-50 border-purple-500 shadow-sm' : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
                    >
                      <input 
                        type="checkbox" 
                        readOnly
                        checked={selectedStudents.includes(student._id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                      />
                      <Avatar src={student.profilePicture} alt={student.name} size={40} className="border-2 border-white" />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                        <p className="text-xs text-gray-500 truncate">{student.department || 'Student'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Section 3: Scheduling & Link */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Schedule & Platform</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    name="sessionDate"
                    required
                    value={formData.sessionDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input 
                    type="time" 
                    name="sessionTime"
                    required
                    value={formData.sessionTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <select 
                    name="sessionDuration"
                    value={formData.sessionDuration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes</option>
                  </select>
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
                          A secure FrontX video room will be created automatically for this session. Students will join it instantly from the app — no external link needed.
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
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                        <select 
                          name="meetingPlatform"
                          value={formData.meetingPlatform}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                        >
                          <option>Google Meet</option>
                          <option>Zoom</option>
                          <option>Microsoft Teams</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link</label>
                        <div className="relative">
                          <Video className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="url" 
                            name="meetingLink"
                            required={formData.meetingType === 'external'}
                            value={formData.meetingLink}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <hr className="border-gray-100" />

            {/* Section 4: Agenda */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Session Agenda</h3>
                </div>
                <button 
                  type="button" 
                  onClick={addAgendaItem}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {agendaItems.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="flex gap-2"
                  >
                    <div className="w-10 h-10 shrink-0 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <input 
                      type="text" 
                      value={item}
                      onChange={(e) => handleAgendaChange(index, e.target.value)}
                      placeholder="e.g. CV Review & Feedback"
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                    />
                    {agendaItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeAgendaItem(index)}
                        className="w-10 h-10 shrink-0 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:scale-[1.02] hover:shadow-purple-500/30'}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Create Session
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionPage;
