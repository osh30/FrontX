import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Briefcase, Brain, BookOpen, UserPlus, 
  FileText, PlayCircle, Heart, Share2, 
  MessageSquare, Users, Download, Calendar, ArrowRight, ExternalLink,
  Lightbulb, Microscope, Loader, CheckCircle, AlertTriangle, TrendingUp, Upload, RefreshCw, Target, Award, Map, Activity, Search, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Avatar from './Avatar';
import { joinSessionMeeting, joinMentorshipMeeting, openMeeting, meetingPlatformLabel } from '../../meeting/lib/sessionJoin';

// SECTION 1 — WELCOME SECTION
export const WelcomeSection = ({ userName = "Nure" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg mb-8"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-gray-600 text-lg max-w-xl">
            Keep building your future through mentorship, continuous learning, and professional collaborations.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// SECTION 2 — RECOMMENDED MENTORS
export const RecommendedMentors = ({ onViewProfile, limit = 2 }) => {
  const [mentors, setMentors] = React.useState([]);
  const navigate = useNavigate();

  const fetchMentors = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/users/mentors?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMentors(limit ? data.mentors.slice(0, limit) : data.mentors);
      }
    } catch (err) {
      console.error("Failed to fetch mentors", err);
    }
  }, [limit]);

  React.useEffect(() => {
    fetchMentors();
    const socket = io('http://localhost:5000');
    socket.on('new_alumni_registered', fetchMentors);
    return () => { socket.disconnect(); };
  }, [fetchMentors]);

  if (mentors.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Mentors</h2>
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No alumni available at the moment.</p>
          <p className="text-sm text-gray-500">Check back later as new mentors join the platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recommended Mentors</h2>
        <button onClick={() => navigate('/dashboard/mentorship')}
          className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {mentors.map((mentor) => (
          <motion.div
            key={mentor._id}
            whileHover={{ y: -5 }}
            className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-md transition-all relative overflow-hidden group cursor-pointer"
            onClick={() => onViewProfile && onViewProfile(mentor._id)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start gap-4">
              <Avatar src={mentor.profilePicture} alt={mentor.name} size={56} className="border-2 border-white shadow-sm shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 truncate">{mentor.name}</h3>
                <p className="text-sm text-gray-500 truncate">{mentor.department || 'Alumni'}</p>
                <p className="text-sm font-medium text-purple-600 mt-0.5 truncate">
                  {mentor.careerInterest || 'Alumni Mentor'}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {(mentor.interests || []).slice(0, 3).map((skill, i) => (
                  <span key={i} className="text-xs bg-white text-gray-600 px-2 py-1 rounded-md border border-gray-100 shadow-sm">{skill}</span>
                ))}
                {(!mentor.interests || mentor.interests.length === 0) && (
                  <span className="text-xs text-gray-400 italic">No interests listed</span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors shadow-md"
                onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(mentor._id); }}
              >
                View Profile
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// SECTION 3 — UPCOMING SESSIONS
const normalizeSession = (s, type) => {
  if (type === 'group') {
    return {
      _id: s._id,
      title: s.sessionTitle,
      category: s.sessionCategory || 'Group Session',
      alumni: s.alumniId,
      meetingType: s.meetingType,
      platform: s.meetingPlatform,
      meetingLink: s.meetingLink,
      date: s.sessionDate,
      time: s.sessionTime,
      duration: s.sessionDuration,
      status: s.status,
      description: s.sessionDescription,
      _sessionType: 'group'
    };
  }
  return { ...s, _sessionType: 'one-on-one' };
};

export const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async (session) => {
    setJoiningId(session._id);
    try {
      const join = session._sessionType === 'group' ? joinMentorshipMeeting : joinSessionMeeting;
      const data = await join(session._id);
      openMeeting(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to open meeting. Please try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const isSessionEnded = (session) => {
    const dateStr = session.date || session.sessionDate;
    const timeStr = session.time || session.sessionTime;
    const duration = session.duration || session.sessionDuration || 30;
    if (!dateStr || !timeStr) return false;
    
    const dateObj = new Date(dateStr);
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1], 10);
    const mins = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3];
    
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    
    dateObj.setHours(hours, mins, 0, 0);
    const endTime = new Date(dateObj.getTime() + duration * 60000);
    return new Date() > endTime;
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [oneOnOneRes, groupRes] = await Promise.all([
        fetch('http://localhost:5000/api/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/mentorship-sessions', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      let all = [];
      if (oneOnOneRes.ok) {
        const data = await oneOnOneRes.json();
        all = all.concat(data.map(s => normalizeSession(s, 'one-on-one')));
      }
      if (groupRes.ok) {
        const data = await groupRes.json();
        all = all.concat(data.map(s => normalizeSession(s, 'group')));
      }

      setSessions(all.filter(s => s.status === 'Upcoming'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const socket = io('http://localhost:5000');
    socket.on('session_updated', fetchSessions);
    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="mb-8 flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getMeetingType = (session) => meetingPlatformLabel(session);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-8">
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white/40 rounded-2xl border border-dashed border-gray-200">
            No upcoming sessions.
          </div>
        ) : (
          sessions.slice(0, 3).map((session, idx) => (
            <motion.div
              key={session._id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 shadow-sm font-bold flex-col shrink-0">
                  <span className="text-[10px] uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg leading-none">{new Date(session.date).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{session.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{getMeetingType(session)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    with {session.alumni?.name || 'Mentor'} • {formatDate(session.date)} • {session.time}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => navigate(`/dashboard/sessions/${session._id}${session._sessionType === 'group' ? '?type=group' : ''}`)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleJoin(session)}
                  disabled={joiningId === session._id || isSessionEnded(session)}
                  className="px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg text-center disabled:opacity-60 disabled:from-gray-400 disabled:to-gray-500"
                >
                  {isSessionEnded(session) ? 'Session Ended' : (joiningId === session._id ? 'Opening...' : 'Join Session')}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// SECTION 4 — CAREER OPPORTUNITIES
export const CareerOpportunities = ({ limit = 4, fullPage = false }) => {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const endpoint = limit ? `http://localhost:5000/api/jobs?limit=${limit}` : 'http://localhost:5000/api/jobs';
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
    const socket = io('http://localhost:5000');
    socket.on('new_job', fetchJobs);
    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="mb-8 flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={fullPage ? '' : 'mb-8'}>
      {fullPage ? (
        <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/10 shadow-[0_0_80px_40px_rgba(255,255,255,0.05)]" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/20"
            >
              <Briefcase className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Career Opportunities</h1>
            <p className="text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              Explore internships, research opportunities, and career openings shared by alumni.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Career Opportunities</h2>
          {limit && (
            <Link to="/dashboard/career" className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
      
      {jobs.length === 0 ? (
        <div className="p-8 text-center text-gray-500 w-full bg-white/40 rounded-2xl border border-dashed border-gray-200">
          No opportunities available at the moment.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <motion.div 
              key={job._id}
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{job.title}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-700 px-2 py-1 rounded-md shrink-0">{job.jobType || 'Full-time'}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-1">{job.company}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-md">
                  {job.deadline ? `Closes ${new Date(job.deadline).toLocaleDateString()}` : 'No Deadline'}
                </span>
                <button className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md">
                  Apply
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// SECTION 5 — AI SKILL ANALYSIS
export const AISkillAnalysis = () => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [profileRes, analysisRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/ai-analysis/me', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (profileRes.status === 'fulfilled') {
        setUserProfile(profileRes.value.data);
      }
      if (analysisRes.status === 'fulfilled') {
        setAnalysis(analysisRes.value.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setErrorState(null);
    if (!userProfile?.resumeUrl) {
      toast.error("Please upload your CV in the profile section first.");
      return;
    }
    
    setGenerating(true);
    try {
      console.log("=== FRONTEND: Starting AI Analysis Request ===");
      console.log("User Profile Resume URL:", userProfile.resumeUrl);
      console.log("User Profile Career Interest:", userProfile.careerInterest);
      
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/ai-analysis/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("=== FRONTEND: Success Response Received ===");
      console.log(res.data);
      
      setAnalysis(res.data);
      toast.success("AI Analysis generated successfully!");
    } catch (error) {
      console.error("=== FRONTEND: Error calling AI API ===", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to generate AI Analysis.";
      setErrorState(errorMsg);
      toast.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-12 flex flex-col items-center justify-center">
          <Loader className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading AI Skill Analysis...</p>
        </div>
      );
    }

    if (errorState) {
      return (
        <div className="p-10 flex flex-col items-center justify-center text-center bg-red-50/50 rounded-2xl border border-red-100">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Analysis Failed</h3>
          <p className="text-red-700 font-medium mb-6">{errorState}</p>
          <button 
            onClick={generateAnalysis}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (generating) {
      return (
        <div className="p-12 flex flex-col items-center justify-center">
          <Brain className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your CV</h3>
          <p className="text-gray-600 font-medium text-center max-w-md">Gemini AI is reading your resume and matching it against your career interest: <span className="font-bold text-purple-600">{userProfile?.careerInterest || 'Tech'}</span>...</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </div>
        </div>
      );
    }

    if (!userProfile?.resumeUrl) {
      return (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload your CV to unlock AI-powered career analysis</h2>
          <p className="text-gray-600 mb-6 max-w-lg">Get deep insights into your skills, identify career gaps, and receive a customized learning roadmap generated by Gemini AI.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Upload className="w-5 h-5" /> Go to Profile & Upload CV
          </button>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Detected. Ready for AI Analysis.</h2>
          <p className="text-gray-600 mb-6 max-w-lg">We found your CV. Generate a comprehensive career gap analysis and learning roadmap using Gemini AI.</p>
          <button 
            onClick={generateAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Brain className="w-5 h-5" /> Generate Analysis
          </button>
        </div>
      );
    }

    return (
      <div className="p-8 flex flex-col items-center justify-center text-center bg-white/60 rounded-2xl border border-white/80 shadow-sm">
        <div className="flex gap-4 items-center mb-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-200" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-purple-500" strokeDasharray={`${analysis.careerReadinessScore || 0}, 100`} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-lg font-black text-gray-900">{analysis.careerReadinessScore || 0}%</span>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
            <p className="text-sm text-gray-500 font-medium">Target: {analysis.careerInterest}</p>
            <p className="text-xs text-gray-400 mt-1">Generated: {new Date(analysis.generatedAt).toLocaleDateString()}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard/ai-skill-analysis')}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
        >
          View Full Analysis Results
        </button>
      </div>
    );
  };

  return (
    <div className="mb-8 p-8 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-md text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Skill Analysis</h2>
            {analysis && (
              <p className="text-sm font-medium text-gray-500">Target Career: <span className="text-purple-600">{analysis.careerInterest || 'Tech'}</span></p>
            )}
          </div>
        </div>
        {(analysis || userProfile?.resumeUrl) && !generating && (
          <button 
            onClick={generateAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Regenerate
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

// SECTION 6 — PROGRESS TRACKER
// SECTION 6 — PROGRESS TRACKER (PREVIEW FOR DASHBOARD)
export const ProgressTrackerPreview = ({ setActiveTab }) => {
  const [progressData, setProgressData] = useState(null);
  const { user } = useAuth();

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgressData(res.data);
    } catch (err) {
      console.error("Failed to fetch progress preview", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgress();
      const socket = io('http://localhost:5000');
      socket.on('progress_updated', () => {
        fetchProgress();
      });
      return () => socket.disconnect();
    }
  }, [user]);

  if (!progressData) {
    return (
      <div className="mb-8 p-8 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/50 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" /> Progress Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track your academic, mentorship, and career development progress over time.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <Award className="w-6 h-6 text-emerald-500 mb-2" />
          <h4 className="text-2xl font-black text-gray-900">{progressData.totalMilestones}</h4>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Milestones</p>
        </div>
        <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center relative">
          <Activity className="w-6 h-6 text-orange-500 mb-2" />
          <h4 className="text-2xl font-black text-gray-900">{progressData.streak} <span className="text-lg">🔥</span></h4>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Day Streak</p>
          <div className="absolute top-2 right-2 flex flex-col items-end">
             <span className="text-[9px] font-bold text-gray-400 uppercase">Longest</span>
             <span className="text-xs font-black text-gray-600">{progressData.longestStreak}</span>
          </div>
        </div>
        <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <Briefcase className="w-6 h-6 text-blue-500 mb-2" />
          <h4 className="text-2xl font-black text-gray-900">{progressData.totalProjects}</h4>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Projects</p>
        </div>
        <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <FileText className="w-6 h-6 text-purple-500 mb-2" />
          <h4 className="text-2xl font-black text-gray-900">{progressData.totalCertificates}</h4>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Certificates</p>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setActiveTab('progress')}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20"
        >
          View Progress Analytics
        </button>
      </div>
    </div>
  );
};

// SECTION 6.1 — PROGRESS ANALYTICS PAGE (DEDICATED)
export const ProgressAnalyticsPage = ({ setActiveTab }) => {
  const [progressData, setProgressData] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgressData(res.data);
    } catch (err) {
      console.error("Failed to fetch progress", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgress();
      const socket = io('http://localhost:5000');
      socket.on('progress_updated', () => {
        fetchProgress();
      });
      return () => socket.disconnect();
    }
  }, [user]);

  if (!progressData) {
    return (
      <div className="mb-8 p-12 text-center text-gray-500 bg-white/40 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-500 mb-4" />
        <p>Loading your career progress...</p>
      </div>
    );
  }

  const { timeline, heatmap, milestones, monthlySummary, growth, nextAction } = progressData;

  // Heatmap rendering logic (GitHub style)
  // Last 90 days grid
  const renderHeatmap = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = heatmap[dateStr] || 0;
      let colorClass = "bg-gray-100";
      if (count === 1) colorClass = "bg-emerald-200";
      else if (count === 2) colorClass = "bg-emerald-300";
      else if (count === 3) colorClass = "bg-emerald-400";
      else if (count > 3) colorClass = "bg-emerald-500";
      
      days.push(
        <div 
          key={dateStr} 
          title={`${count} activities on ${dateStr}`}
          className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${colorClass} transition-colors hover:ring-2 ring-purple-300`}
        ></div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
          <span>90 Days Ago</span>
          <span>Today</span>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 w-full">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-12 space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" /> Career Progress
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track your growth and unlock milestones automatically.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/50 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Growth Timeline</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#e9d5ff', strokeWidth: 2}}
                />
                <Line type="monotone" dataKey="activities" stroke="#9333ea" strokeWidth={3} dot={{r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap & Next Action */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Activity Heatmap</h3>
            {renderHeatmap()}
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-500/20 flex-1 flex flex-col justify-center">
            <h3 className="font-semibold text-purple-100 text-sm mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" /> Next Recommended Action
            </h3>
            <h4 className="font-bold text-xl mb-2 mt-2">{nextAction?.title}</h4>
            <p className="text-sm text-purple-100 mb-6">{nextAction?.desc}</p>
            <button 
              onClick={() => {
                if (nextAction?.target === 'collaboration') {
                  setActiveTab('collaboration');
                } else if (nextAction?.target === 'dashboard') {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('profile'); // profile edit mode handles specific sections via internal logic or user scrolling
                }
              }} 
              className="mt-auto px-5 py-2.5 bg-white text-purple-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors inline-block w-max shadow-sm"
            >
              {nextAction?.buttonText || "Take Action"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Monthly Summary */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm flex flex-col justify-center">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">This Month</h3>
          <ul className="space-y-3 text-sm font-medium text-gray-700">
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-semibold">Projects</span> 
              <div className="flex items-center gap-2">
                <span className="font-black text-blue-600 text-lg">{monthlySummary?.projects}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${growth?.projects > 0 ? 'bg-emerald-100 text-emerald-700' : growth?.projects < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                  {growth?.projects > 0 ? '+' : ''}{growth?.projects || 0}
                </span>
              </div>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-semibold">Certificates</span> 
              <div className="flex items-center gap-2">
                <span className="font-black text-purple-600 text-lg">{monthlySummary?.certificates}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${growth?.certificates > 0 ? 'bg-emerald-100 text-emerald-700' : growth?.certificates < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                  {growth?.certificates > 0 ? '+' : ''}{growth?.certificates || 0}
                </span>
              </div>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-semibold">Class Notes</span> 
              <div className="flex items-center gap-2">
                <span className="font-black text-orange-600 text-lg">{monthlySummary?.notes}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${growth?.notes > 0 ? 'bg-emerald-100 text-emerald-700' : growth?.notes < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                  {growth?.notes > 0 ? '+' : ''}{growth?.notes || 0}
                </span>
              </div>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-semibold">Mentorships</span> 
              <div className="flex items-center gap-2">
                <span className="font-black text-pink-600 text-lg">{monthlySummary?.mentorships}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${growth?.mentorships > 0 ? 'bg-emerald-100 text-emerald-700' : growth?.mentorships < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                  {growth?.mentorships > 0 ? '+' : ''}{growth?.mentorships || 0}
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Milestones */}
        <div className="md:col-span-3 bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Career Milestones</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((item, idx) => {
              const IconComp = {
                UserPlus: UserPlus,
                Briefcase: Briefcase,
                Award: Award,
                FileText: FileText,
                Users: Users,
                Target: Target
              }[item.icon] || CheckCircle;
              
              return (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.unlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-dashed border-gray-200 opacity-60'}`}>
                  <div className={`p-3 rounded-xl shrink-0 ${item.unlocked ? item.bg + ' ' + item.color : 'bg-gray-200 text-gray-400'}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    <p className={`text-xs font-semibold mt-0.5 ${item.unlocked ? 'text-emerald-600' : 'text-gray-500'}`}>{item.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// SECTION 7 — RESOURCE HUB
export const ResourceHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ["All", "📚 Book / eBook", "📄 Research Paper", "🎓 Course Material", "📝 Academic Notes", "💼 Career Guide", "🎤 Interview Preparation", "🔬 Research Guide", "🧑‍💻 Project Resource", "📊 Industry Report", "🎥 Video Resource", "🔗 Useful Website", "📁 Other"];

  useEffect(() => {
    fetchResources();
    const socket = io('http://localhost:5000');
    socket.on('new_resource', (newResource) => {
      setResources(prev => [newResource, ...prev]);
    });
    socket.on('resource:updated', (updated) => {
      setResources(prev => prev.map(r => r._id === updated._id ? updated : r));
    });
    socket.on('resource:deleted', ({ _id }) => {
      setResources(prev => prev.filter(r => r._id !== _id));
    });
    return () => socket.disconnect();
  }, [activeCategory, searchTerm]);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      let url = `http://localhost:5000/api/resources?category=${encodeURIComponent(activeCategory)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(Array.isArray(res.data) ? res.data : (res.data?.resources || []));
    } catch (err) {
      console.error("Failed to fetch resources", err);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileIcon = (res) => {
    if (res.uploadType === 'ExternalLink') return ExternalLink;
    if (res.fileType?.includes('pdf')) return FileText;
    if (res.fileType?.includes('video') || res.fileType?.includes('mp4')) return PlayCircle;
    return BookOpen;
  };

  return (
    <div className="mb-12 space-y-4">
      {resources.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white/50 rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No resources found matching your criteria.</p>
          {user?.role === 'alumni' && (
            <button 
              onClick={() => navigate('/alumni/resources/upload')}
              className="mt-4 text-purple-600 text-sm font-bold hover:underline"
            >
              Be the first to upload one!
            </button>
          )}
        </div>
      ) : resources.slice(0, 4).map((res) => {
        const FileIcon = getFileIcon(res);
        return (
          <motion.div
            key={res._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
          >
            {res.isFeatured && (
              <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-sm" title="Featured Resource">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="w-20 min-h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center text-purple-600 shadow-sm">
                <FileIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col sm:flex-row gap-4 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-600 transition-colors truncate">
                    {res.title}
                  </h3>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    {res.category.replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim()}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {res.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={res.alumniId?.profilePicture} alt="Alumni" size={24} className="border border-gray-200 shrink-0" />
                    <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]">{res.alumniId?.name || 'Alumni'}</span>
                  </div>
                  {res.alumniId?.department && (
                    <span className="text-xs text-gray-400 hidden sm:inline">• {res.alumniId.department}</span>
                  )}
                  <span className="text-xs text-gray-400">• {formatDate(res.createdAt)}</span>
                </div>

                {res.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {res.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {res.tags.length > 3 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        +{res.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:justify-center gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/resources/${res._id}`, { state: { resource: res } }); }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                >
                  View Details
                </button>
                <div className="flex items-center gap-3 text-gray-400">
                  <Download className="w-4 h-4" />
                  <span className="text-xs font-bold text-gray-500">{res.downloads}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// SECTION 8 — RECOMMENDED LEARNING (Student Notes Library)
export const RecommendedLearning = ({ limit = 3 }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
    const socket = io('http://localhost:5000');
    socket.on('new_note_uploaded', () => {
      fetchNotes();
    });
    return () => socket.disconnect();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/notes?sort=latest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recommended Learning</h2>
        <button onClick={() => navigate('/dashboard/learnings')}
          className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No study notes uploaded yet.</p>
          <p className="text-sm text-gray-500">Be the first to share notes with your peers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(limit ? notes.slice(0, limit) : notes).map((note, index) => {
            const uploader = note.studentId;
            return (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header */}
                <div className="h-28 relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-indigo-700 shadow-sm flex items-center gap-1">
                      <FileText className="w-3 h-3" /> PDF
                    </span>
                    {note.department && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-blue-700 shadow-sm">
                        {note.department}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-sm drop-shadow-lg line-clamp-1">{note.title}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  {(note.course || note.subject) && (
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide mb-1">
                      {note.course || note.subject}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{note.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={uploader?.profilePicture} alt={uploader?.name} size={20} className="border-2 border-white shadow-sm" />
                      <span className="text-[11px] text-gray-500 truncate">{uploader?.name || 'Student'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/dashboard/learnings/${note._id}`)}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-indigo-600 transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    View Note <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// SECTION 9 — ANONYMOUS SHARING
export const AnonymousSharing = () => {
  const [posts, setPosts] = React.useState([]);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/community-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.slice(0, 3)); // Display top 3 latest
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-colors" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Community Feed</h2>
        </div>
        <button 
          onClick={() => navigate('/create-community-post')}
          className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          Create Post
        </button>
      </div>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-4">
            No community discussions yet.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="p-4 bg-white/60 rounded-2xl border border-white/50 shadow-sm">
              <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap line-clamp-3">{post.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Heart className={`w-4 h-4 ${post.isLiked ? 'text-red-500 fill-current' : ''}`} /> {post.likesCount}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.commentsCount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// SECTION 10 — STUDENT NETWORK
export const StudentNetwork = () => {
  const [students, setStudents] = React.useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/users/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let allStudents = res.data.filter(s => s._id !== user?.id && s._id !== user?._id);
        
        // Matching Logic
        allStudents = allStudents.map(student => {
          let score = 0;
          if (student.department === user?.department) score += 2;
          if (student.session === user?.session) score += 2;
          
          const studentInterests = student.interests || [];
          const userInterests = user?.interests || [];
          
          userInterests.forEach(ui => {
            if (studentInterests.includes(ui)) score += 1;
          });
          
          return { ...student, matchScore: score };
        });
        
        allStudents.sort((a, b) => b.matchScore - a.matchScore);
        
        setStudents(allStudents.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    if (user) {
      fetchStudents();
      
      const socket = io('http://localhost:5000');
      socket.on('student_updated', () => {
        fetchStudents();
      });
      
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  if (students.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Suggested Students</h2>
        <div className="p-8 text-center text-gray-500 w-full bg-white/40 rounded-2xl border border-dashed border-gray-200">
          No suggested students at the moment. Update your profile to get matches!
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Suggested Students</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {students.map((student, idx) => (
          <motion.div key={student._id || idx} whileHover={{ y: -4 }} className="p-5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-center flex flex-col items-center">
            <Avatar src={student.profilePicture} alt={student.name} size={64} className="border-2 border-white shadow-sm mb-3" />
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{student.name}</h4>
            <p className="text-xs text-gray-500 mb-1 line-clamp-1">{student.department || "University"} • {student.session || "Student"}</p>
            <p className="text-[10px] text-purple-600 font-medium mb-4 bg-purple-50 px-2 py-1 rounded-full line-clamp-1">
              {(student.interests && student.interests.length > 0) ? student.interests.slice(0, 2).join(', ') : "Networking"}
            </p>
            <div className="w-full flex mt-auto">
              <button 
                onClick={() => navigate(`/dashboard/profile/${student._id}`)}
                className="w-full py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// SECTION 11 — COLLABORATION
export const CollaborationSection = () => {
  const [activeCount, setActiveCount] = React.useState(0);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/collaboration', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActiveCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch collaboration posts", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Collaboration Opportunities</h2>
        <Link to="/dashboard/collaboration" className="text-purple-600 font-medium text-sm hover:underline">View All</Link>
      </div>
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-3xl p-[1px] shadow-lg"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.08]" />
        <div
          className="relative rounded-[calc(1.5rem-1px)] overflow-hidden"
          style={{
            background: 'linear-gradient(165deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                background: 'linear-gradient(115deg, transparent 15%, rgba(148,163,184,0.6) 35%, rgba(255,255,255,0.9) 50%, rgba(148,163,184,0.6) 65%, transparent 85%)',
                backgroundSize: '250% 100%',
                animation: 'shimmerSweep 8s ease-in-out infinite',
              }} />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.3) 45%, rgba(139,92,246,0.4) 50%, rgba(59,130,246,0.3) 55%, transparent 75%)',
                backgroundSize: '300% 100%',
                animation: 'shimmerSweep 12s ease-in-out infinite 2s',
              }} />
            {[
              { left: '10%', top: '30%', size: 2, delay: 0, dur: 8 },
              { left: '80%', top: '20%', size: 1.8, delay: 1.2, dur: 9 },
              { left: '50%', top: '85%', size: 2.2, delay: 2.5, dur: 7 },
              { left: '90%', top: '55%', size: 1.5, delay: 0.8, dur: 10 },
              { left: '30%', top: '60%', size: 2, delay: 3, dur: 7.5 },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: p.left, top: p.top,
                  width: p.size, height: p.size,
                  background: i % 3 === 0
                    ? 'radial-gradient(circle, rgba(148,163,184,0.8), transparent)'
                    : i % 3 === 1
                      ? 'radial-gradient(circle, rgba(96,165,250,0.7), transparent)'
                      : 'radial-gradient(circle, rgba(167,139,250,0.6), transparent)',
                  animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="absolute -right-12 -top-12 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.08] backdrop-blur-md flex items-center justify-center border border-white/[0.1] shrink-0">
                  <Microscope className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Research & Projects</h3>
                  <p className="text-slate-300 max-w-md text-sm mb-3 leading-relaxed">
                    Collaborate with mentors and alumni on cutting-edge research papers and innovative projects to build your portfolio.
                  </p>
                  <div className="inline-block px-3 py-1 bg-white/[0.08] text-blue-300 text-xs font-bold rounded-lg border border-white/[0.08]">
                    {activeCount} Active {activeCount === 1 ? 'Opportunity' : 'Opportunities'}
                  </div>
                </div>
              </div>
              <Link 
                to="/dashboard/collaboration"
                className="shrink-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Collaboration Request
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
          25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; }
          50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; }
          75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
};

