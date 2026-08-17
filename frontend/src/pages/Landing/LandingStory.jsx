import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Users, GraduationCap, Briefcase, BookOpen, Brain, Plus, Star } from 'lucide-react';
import { API_BASE } from '../../config/api';

const StoryBlock = ({ title, subtitle, description, icon: Icon, color, bg, imageContent, reversed, lead, actions, centered, descriptionClassName, descriptionColor }) => {
  return (
    <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-24 items-center min-h-[70vh] py-12 relative z-10 ${centered ? 'justify-center' : ''}`}>
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`flex-1 space-y-6 ${centered ? 'flex flex-col items-center text-center' : ''}`}
      >
        {subtitle && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${color} dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-semibold text-sm`}>
            <Icon className="w-5 h-5" />
            {subtitle}
          </div>
        )}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        {lead && (
          <p className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
            {lead}
          </p>
        )}
        <p className={`text-xl ${descriptionColor || 'text-gray-600'} leading-relaxed ${descriptionClassName || 'max-w-xl'}`}>
          {description}
        </p>
        {actions && (
          <div className={`flex flex-wrap gap-4 pt-2 ${centered ? 'justify-center' : ''}`}>
            {actions.map((action, i) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`px-7 py-3.5 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-[350ms] ease-in-out ${
                  action.variant === 'secondary'
                    ? 'border-2 border-gray-300 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50 hover:-translate-y-[2px]'
                    : 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-lg shadow-blue-600/20 hover:shadow-[0_0_24px_rgba(96,165,250,0.35)] hover:-translate-y-[2px] hover:scale-[1.02]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {action.icon && <action.icon className="w-[18px] h-[18px]" />}
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Visual Content */}
      {imageContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: reversed ? -40 : 40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="flex-1 w-full"
        >
          {imageContent}
        </motion.div>
      )}
    </div>
  );
};

// ─── Premium AI Visualization ───

const AIVisualization = () => {
  const skills = [
    { label: "React & Node.js", score: "95%", status: "Strong", barColor: "bg-green-500", barWidth: "95%", textColor: "text-green-400" },
    { label: "System Design", score: "40%", status: "Gap Detected", barColor: "bg-orange-500", barWidth: "40%", textColor: "text-orange-400" },
    { label: "Cloud Architecture", score: "20%", status: "Missing", barColor: "bg-red-500", barWidth: "20%", textColor: "text-red-400" },
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#081A3A] to-[#0F2D5C] rounded-3xl p-8 border border-blue-400/15 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none will-change-transform" />
      <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-purple-500/8 rounded-full blur-[80px] pointer-events-none" />

      {/* AI Network SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="180" r="80" fill="url(#coreGlow)" />
        <circle cx="200" cy="180" r="25" fill="rgba(96,165,250,0.4)">
          <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="180" r="12" fill="rgba(255,255,255,0.3)" filter="url(#glow)">
          <animate attributeName="r" values="10;14;10" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {[
          { x: 120, y: 110 }, { x: 280, y: 100 }, { x: 310, y: 210 },
          { x: 260, y: 290 }, { x: 140, y: 280 }, { x: 90, y: 200 },
        ].map((node, i) => (
          <g key={i}>
            <line x1="200" y1="180" x2={node.x} y2={node.y} stroke="url(#netGrad)" strokeWidth="1" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
            <circle cx={node.x} cy={node.y} r="4" fill="#60a5fa" opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={node.x} cy={node.y} r="2" fill="white" opacity="0.6" />
            <circle r="1.5" fill="#818cf8" opacity="0.6">
              <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" path={`M200,180 ${node.x},${node.y}`} rotate="auto" />
            </circle>
          </g>
        ))}
      </svg>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
        >
          <Brain className="w-7 h-7" />
        </motion.div>
        <div>
          <motion.h4
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.3 }}
            className="font-bold text-white text-lg"
          >
            AI CV Analysis
          </motion.h4>
        </div>
      </div>

      {/* Skill Cards */}
      <div className="relative z-10 space-y-3">
        {skills.map((skill, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.3, delay: 0.08 * i }}
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.div
              animate={{ y: [0, -3 - i * 0.5, 0] }}
              transition={{
                duration: 3.5 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.25,
              }}
              className="p-5 bg-white/[0.06] rounded-2xl border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.15] transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white/80 text-sm">{skill.label}</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 150, damping: 15 }}
                  className={`text-sm font-bold ${skill.textColor}`}
                >
                  {skill.score}
                </motion.span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: skill.barWidth }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${skill.barColor}`}
                />
              </div>
              <span className={`text-xs font-medium text-white/40 mt-1.5 block`}>{skill.status}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const AiCareerAnalysisStory = () => {
  return (
    <StoryBlock
      title={<span>Your Personal AI Career Assistant</span>}
      description="Upload your CV and let our advanced AI analyze your profile against industry standards. Discover exactly what you need to land your dream job with personalized learning roadmaps and skill gap detection."
      icon={Sparkles}
      color="text-blue-700"
      bg="bg-blue-100"
      reversed={false}
      imageContent={<AIVisualization />}
    />
  );
};

export const FindAlumniMentorStory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPublicAlumni = async () => {
      try {
        let res = await fetch(`${API_BASE}/users/public-alumni`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/alumni/public`);
        }
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.alumni && Array.isArray(data.alumni)) {
            setAlumniList(data.alumni.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Failed to fetch public alumni for landing page:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPublicAlumni();
    return () => { isMounted = false; };
  }, []);

  const handleConnect = (alumniId) => {
    if (user) {
      if (user.role === 'student' || user.role === 'alumni') {
        navigate('/dashboard/mentorship');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <StoryBlock
      title={<span>Connect with alumni who have walked your path</span>}
      description="Don't guess what it takes. Browse verified alumni profiles from your university. Send connection requests tailored to your career goals."
      icon={Users}
      color="text-purple-700"
      bg="bg-purple-100"
      reversed={true}
      imageContent={
        loading ? (
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gradient-to-br from-[#08152F] to-[#0F2D5C] rounded-[22px] p-7 border border-blue-400/15 flex flex-col items-center animate-pulse">
                <div className="w-[90px] h-[90px] rounded-full bg-white/10 mb-5" />
                <div className="w-24 h-4 bg-white/20 rounded mb-2" />
                <div className="w-32 h-3 bg-white/10 rounded mb-5" />
                <div className="w-full h-9 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : alumniList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#08152F] to-[#0F2D5C] rounded-[22px] border border-blue-400/15 text-center">
            <Users className="w-12 h-12 text-blue-400/50 mb-3" />
            <p className="text-gray-300 font-medium text-base">No alumni profiles available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {alumniList.map((person, i) => (
              <motion.div
                key={person._id || person.id || i}
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.3, delay: 0.08 * i }}
                style={{ willChange: 'transform, opacity' }}
              >
                <motion.div
                  animate={{ y: [0, -2.5, 0] }}
                  transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.4 }}
                    className="group relative bg-gradient-to-br from-[#08152F] to-[#0F2D5C] rounded-[22px] p-7 border border-blue-400/15 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] transition-shadow duration-300 flex flex-col items-center text-center overflow-hidden"
                  >
                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none rounded-[22px]" />
                    <div className="absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        padding: '1px',
                        background: 'linear-gradient(135deg, rgba(96,165,250,0.4), rgba(139,92,246,0.2), rgba(96,165,250,0.4))',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />

                    {/* Profile image */}
                    <div className="w-[90px] h-[90px] rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(96,165,250,0.25)] mb-5 overflow-hidden flex-shrink-0">
                      {person.profilePicture ? (
                        <img
                          src={person.profilePicture}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-gradient-to-b from-[#2A3A5C] to-[#1A2744] flex items-center justify-center"
                        style={{ display: person.profilePicture ? 'none' : 'flex' }}
                      >
                        <svg viewBox="0 0 24 24" fill="#5A6E9E" className="w-10 h-10">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    <h4 className="text-[22px] font-bold text-white leading-tight mb-1 truncate max-w-full px-1" title={person.name}>
                      {person.name}
                    </h4>
                    <p className="text-[15px] font-medium text-gray-400 mb-5 line-clamp-2 px-1" title={person.workTitle}>
                      {person.workTitle}
                    </p>

                    {/* Connect button */}
                    <motion.button
                      onClick={() => handleConnect(person._id || person.id)}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-lg shadow-blue-500/20 hover:shadow-[0_8px_30px_rgba(96,165,250,0.3)] transition-shadow duration-300 flex items-center justify-center gap-2 group"
                    >
                      <span>Connect</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )
      }
    />
  );
};

export const AttendMentorshipSessionStory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRecruiterAction = (tab) => {
    if (user?.role === 'recruiter') {
      navigate(`/dashboard/${tab}`);
    } else {
      navigate('/register?role=recruiter');
    }
  };

  return (
    <section className="py-20 md:py-28 relative">
      <div className="mx-auto w-[92%] max-w-[1400px] relative rounded-[28px] bg-[#08152F] overflow-hidden border border-blue-400/10 shadow-[0_40px_100px_-30px_rgba(8,21,47,0.7)]">
        {/* Low-opacity grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(96,165,250,0.14)_1px,transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.02] pointer-events-none" />

        {/* Elegant glass edge highlight */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
        />

        {/* Soft blue glow near the bottom corners */}
        <div className="absolute -bottom-28 -left-28 w-[380px] h-[380px] bg-blue-500/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-[380px] h-[380px] bg-indigo-500/20 rounded-full blur-[110px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-16 py-16 md:py-20 min-h-[480px] space-y-7"
        >
          {/* Title */}
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] max-w-5xl">
            Hire top talent through FrontX
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl font-medium text-white">
            Your next great hire is already here.
          </p>

          {/* Description */}
          <p className="text-[17px] md:text-xl text-[#C7CEDB] leading-[1.9] max-w-3xl">
            Post exclusive job and internship opportunities directly to a vetted pool of top students and alumni. Review pre-screened resumes, shortlist the best fits, and build your team faster with candidates proven by the FrontX community.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 justify-center">
            <button onClick={() => handleRecruiterAction('post-opportunity')} className="px-8 py-4 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-[350ms] ease-in-out bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_10px_35px_-5px_rgba(59,130,246,0.6)] hover:-translate-y-[3px] hover:shadow-[0_18px_45px_-5px_rgba(59,130,246,0.75)] hover:scale-[1.02]">
              <span className="flex items-center gap-2">
                <Plus className="w-[18px] h-[18px]" />
                Post Opportunity
              </span>
            </button>
            <button onClick={() => handleRecruiterAction('interviews')} className="px-8 py-4 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-[350ms] ease-in-out bg-transparent border border-white/25 text-white hover:border-blue-400/70 hover:text-blue-100 hover:bg-white/[0.06] hover:shadow-[0_0_25px_rgba(96,165,250,0.25)]">
              <span className="flex items-center gap-2">
                Interview Candidates
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const JoinResearchStory = () => {
  return (
    <StoryBlock
      title="Build a strong academic portfolio"

      description="Collaborate with professors and alumni on cutting-edge research. Gain hands-on experience, co-author papers, and strengthen your profile for higher studies and prestigious roles."
      icon={GraduationCap}
      color="text-cyan-700"
      bg="bg-cyan-100"
      reversed={true}
      imageContent={
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
           <div className="relative z-10 space-y-6">
             {[
                { title: "Quantum Computing Algorithms", type: "Computer Science", mentor: "Sabbir" },
                { title: "AI in Healthcare Diagnostics", type: "Machine Learning", mentor: "Fatema" }
              ].map((project, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-cyan-200 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{project.title}</h4>
                      <p className="text-sm text-blue-900 dark:text-blue-300 font-semibold">{project.type}</p>
                    </div>
                    <span className="px-3 py-1 bg-cyan-50 text-blue-900 text-xs font-bold rounded-full">Active</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                   <Users className="w-4 h-4" /> Led by {project.mentor}
                 </div>
                  <button className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-medium rounded-xl border border-transparent transition-all duration-[350ms] ease-in-out hover:bg-[#1E3A8A] dark:hover:bg-blue-100 hover:text-white hover:shadow-[0_0_24px_rgba(96,165,250,0.25)] hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-xl hover:border-blue-400/20 cursor-pointer">
                    Apply to Join
                  </button>
               </div>
             ))}
           </div>
        </div>
      }
    />
  );
};

const ResourceIcon = ({ type }) => {
  const icons = {
    system: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="cubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="iconGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#iconGlow)">
          <path d="M24 6 L40 16 L40 34 L24 44 L8 34 L8 16 Z" fill="none" stroke="url(#cubeGrad)" strokeWidth="1.8" opacity="0.7" />
          <path d="M24 6 L24 44" fill="none" stroke="url(#cubeGrad)" strokeWidth="1.2" opacity="0.4" />
          <line x1="8" y1="16" x2="40" y2="16" stroke="url(#cubeGrad)" strokeWidth="1.2" opacity="0.5" />
          <line x1="8" y1="16" x2="24" y2="6" stroke="url(#cubeGrad)" strokeWidth="1.2" opacity="0.5" />
          <line x1="40" y1="16" x2="24" y2="6" stroke="url(#cubeGrad)" strokeWidth="1.2" opacity="0.5" />
          <circle cx="24" cy="6" r="2.5" fill="#60a5fa" />
          <circle cx="8" cy="16" r="2" fill="#60a5fa" opacity="0.8" />
          <circle cx="40" cy="16" r="2" fill="#60a5fa" opacity="0.8" />
          <circle cx="24" cy="44" r="2" fill="#60a5fa" opacity="0.8" />
        </g>
        <circle cx="24" cy="25" r="1.5" fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="16" cy="30" r="1" fill="#93c5fd" opacity="0.5">
          <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="20" r="1" fill="#93c5fd" opacity="0.5">
          <animate attributeName="opacity" values="0.1;0.6;0.1" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    react: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="atomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="atomGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#atomGlow)">
          <ellipse cx="24" cy="24" rx="14" ry="5" fill="none" stroke="url(#atomGrad)" strokeWidth="1.5" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="24" cy="24" rx="14" ry="5" fill="none" stroke="url(#atomGrad)" strokeWidth="1.5" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="60 24 24" to="420 24 24" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="24" cy="24" rx="14" ry="5" fill="none" stroke="url(#atomGrad)" strokeWidth="1.5" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="120 24 24" to="480 24 24" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="24" cy="24" r="4" fill="url(#atomGrad)" opacity="0.8" />
        </g>
        {[0, 120, 240].map((angle, i) => (
          <circle key={i} r="2" fill="white" opacity="0.7" filter="url(#atomGlow)">
            <animateMotion dur="4s" repeatCount="indefinite" path={`M 24 19 A 14 5 0 1 1 23.99 19`} begin={`${-angle / 360 * 4}s`} />
          </circle>
        ))}
      </svg>
    ),
    tree: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="treeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#treeGlow)">
          <circle cx="24" cy="8" r="3" fill="none" stroke="url(#treeGrad)" strokeWidth="1.8" />
          <line x1="24" y1="11" x2="24" y2="16" stroke="url(#treeGrad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="24" y1="16" x2="14" y2="22" stroke="url(#treeGrad)" strokeWidth="1.5" opacity="0.5" />
          <line x1="24" y1="16" x2="34" y2="22" stroke="url(#treeGrad)" strokeWidth="1.5" opacity="0.5" />
          <circle cx="14" cy="24" r="2.5" fill="none" stroke="url(#treeGrad)" strokeWidth="1.5" />
          <circle cx="34" cy="24" r="2.5" fill="none" stroke="url(#treeGrad)" strokeWidth="1.5" />
          <line x1="14" y1="26.5" x2="14" y2="32" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.4" />
          <line x1="34" y1="26.5" x2="34" y2="32" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.4" />
          <line x1="14" y1="32" x2="8" y2="37" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.4" />
          <line x1="14" y1="32" x2="20" y2="37" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.4" />
          <line x1="34" y1="32" x2="28" y2="37" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.4" />
          <line x1="34" y1="32" x2="40" y2="37" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.4" />
          <circle cx="8" cy="39" r="2" fill="none" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.7" />
          <circle cx="20" cy="39" r="2" fill="none" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.7" />
          <circle cx="28" cy="39" r="2" fill="none" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.7" />
          <circle cx="40" cy="39" r="2" fill="none" stroke="url(#treeGrad)" strokeWidth="1.2" opacity="0.7" />
        </g>
        <circle cx="24" cy="8" r="1" fill="white" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle r="1.5" fill="white" opacity="0.5" filter="url(#treeGlow)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M 24 11 L 14 22 L 14 32 L 8 37" />
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    chat: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#d8b4fe" />
          </linearGradient>
          <filter id="chatGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#chatGlow)">
          <path d="M8 6 C8 4.9 8.9 4 10 4 L38 4 C39.1 4 40 4.9 40 6 L40 30 C40 31.1 39.1 32 38 32 L18 32 L10 40 L10 32 L8 32 C6.9 32 6 31.1 6 30 L6 6 Z" fill="none" stroke="url(#chatGrad)" strokeWidth="1.8" opacity="0.7" />
          <line x1="14" y1="14" x2="34" y2="14" stroke="url(#chatGrad)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
          <line x1="14" y1="21" x2="28" y2="21" stroke="url(#chatGrad)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
        </g>
        <circle cx="36" cy="10" r="3" fill="#d8b4fe" opacity="0.3">
          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="36" cy="10" r="1" fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  };

  return (
    <div className="w-full h-full relative">
      {icons[type] || null}
    </div>
  );
};

export const AccessResourcesStory = () => {
  return (
    <StoryBlock
      title="Unlock curated learning resources"
      description="Stop searching endless forums. Access a curated library of high-quality notes, development roadmaps, and course materials shared directly by top students and experienced alumni."
      icon={BookOpen}
      color="text-teal-700"
      bg="bg-teal-100"
      reversed={false}
      imageContent={
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: "System Design Prep Guide", icon: "system" },
            { title: "React Performance Tips", icon: "react" },
            { title: "Data Structures Roadmap", icon: "tree" },
            { title: "Behavioral Interview Qs", icon: "chat" }
          ].map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 100, damping: 18, mass: 0.3, delay: 0.08 * i }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-[#081A3A] to-[#0B1635] rounded-3xl p-6 border border-blue-400/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] cursor-pointer transition-all duration-[350ms] ease-in-out h-48 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:border-blue-400/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-3xl" />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  padding: '1px',
                  background: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(139,92,246,0.15), rgba(96,165,250,0.3))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              {/* Small book icon - top left */}
              <div className="absolute top-5 left-5 z-10">
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/15 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-shadow duration-300"
                >
                  <BookOpen className="w-5 h-5 text-cyan-300" />
                </motion.div>
              </div>

              {/* Large center icon + title */}
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 4 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform duration-[350ms]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500" />
                  <ResourceIcon type={res.icon} />
                </motion.div>
                <h4 className="font-bold text-white/90 text-sm md:text-[15px] text-center leading-snug group-hover:text-white transition-colors duration-300">{res.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      }
    />
  );
};

export const CareerOpportunitiesStory = () => {
  return (
    <StoryBlock
      title="Land exclusive job opportunities"
      description="Skip the general application pile. Access exclusive job and internship postings directly referred by your university alumni network working at top tech companies."
      icon={Briefcase}
      color="text-indigo-700"
      bg="bg-indigo-100"
      reversed={true}
      imageContent={
        <div className="space-y-4">
          {[
            { role: "Software Engineer", company: "Google", location: "Remote", type: "Full-time" },
            { role: "Product Design Intern", company: "Meta", location: "London", type: "Internship" },
            { role: "Frontend Developer", company: "Stripe", location: "New York", type: "Full-time" }
          ].map((job, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -7, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.4 }}
              className="group relative bg-gradient-to-br from-[#132C5C] to-[#0E1F45] rounded-2xl p-6 border border-blue-400/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-[350ms] ease-out hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] hover:border-blue-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-2xl" />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  padding: '1px',
                  background: 'linear-gradient(135deg, rgba(96,165,250,0.25), rgba(139,92,246,0.12), rgba(96,165,250,0.25))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/15 rounded-xl flex items-center justify-center font-bold text-blue-300/80 group-hover:text-indigo-200 group-hover:bg-blue-500/15 transition-all duration-300">
                    {job.company[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white/90 group-hover:text-white transition-colors duration-300">{job.role}</h4>
                    <p className="text-sm text-blue-200/60 group-hover:text-blue-200/80 transition-colors duration-300">{job.company} • {job.location}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/[0.08] text-blue-200 font-semibold rounded-xl text-sm border border-white/[0.06] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-white/[0.15] group-hover:text-white group-hover:shadow-[0_0_16px_rgba(96,165,250,0.15)]">
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      }
    />
  );
};
