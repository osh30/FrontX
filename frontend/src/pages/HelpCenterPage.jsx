import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HelpCircle, User, LayoutDashboard, GraduationCap, Handshake, BookOpen,
  MessageSquare, Briefcase, Microscope, Mail, Phone, ArrowRight,
  ChevronDown, CheckCircle2, Search, Shield, LogIn, Edit3, FileText,
  Users, Target, Rocket, Star, Send
} from 'lucide-react';
import LandingNavbar from './Landing/LandingNavbar';
import LandingFooter from './Landing/LandingFooter';

const QUICK_HELP = [
  { icon: LogIn, title: 'Account & Login', desc: 'Create your account, log in, and manage your credentials securely.', color: '#3b82f6' },
  { icon: LayoutDashboard, title: 'Student Dashboard', desc: 'Navigate your personalized dashboard and track your progress.', color: '#8b5cf6' },
  { icon: GraduationCap, title: 'Alumni Dashboard', desc: 'Manage mentorship sessions, resources, and collaboration topics.', color: '#a78bfa' },
  { icon: Handshake, title: 'Mentorship', desc: 'Connect with verified alumni for 1-on-1 guidance and career advice.', color: '#22d3ee' },
  { icon: BookOpen, title: 'Resources', desc: 'Access and share academic notes, roadmaps, and study materials.', color: '#f59e0b' },
  { icon: MessageSquare, title: 'Community', desc: 'Engage in discussions, ask questions, and share experiences.', color: '#34d399' },
  { icon: Briefcase, title: 'Career Opportunities', desc: 'Apply for jobs and internships shared by your alumni network.', color: '#fb923c' },
  { icon: Microscope, title: 'Research & Collaboration', desc: 'Join research projects led by alumni or professors.', color: '#f87171' },
];

const FAQS = [
  { q: 'How do I create an account?', a: 'Click "Get Started Free" on the landing page, fill in your details including your university affiliation, and verify your email. Students must be currently enrolled or recently graduated. Alumni must have a verified connection to a recognized university.' },
  { q: 'How do I book a mentorship session?', a: 'Navigate to the Mentorship section from your dashboard, browse available alumni mentors by field and expertise, select a mentor, choose an available time slot, and confirm your booking. You\'ll receive a confirmation notification.' },
  { q: 'How do I upload academic resources?', a: 'Go to Resources from your dashboard, click "Upload Resource," add a title, description, category, and attach your file. Resources are reviewed before being published to ensure quality and accuracy.' },
  { q: 'How do I edit my profile?', a: 'Click on your profile icon in the top-right corner, select "Edit Profile," and update your information including bio, skills, education, and profile picture. Changes are saved automatically.' },
  { q: 'How do I join a research collaboration?', a: 'Browse available research topics in the Collaboration section, review the project details and requirements, then click "Apply." The project lead will review your application and respond within a few days.' },
  { q: 'How do I create a community post?', a: 'Navigate to the Community section, click "Create Post," choose a category, write your content, and publish. You can also post anonymously if you prefer.' },
  { q: 'How do I apply for career opportunities?', a: 'Browse the Career Opportunities section, filter by field or location, review the job details, and click "Apply." You may be redirected to the employer\'s application page or apply directly through Frontx.' },
  { q: 'How do I reset my password?', a: 'On the login page, click "Forgot Password," enter your registered email address, and follow the link sent to your inbox. The reset link is valid for 24 hours.' },
];

const STEPS = [
  { icon: User, title: 'Create Account', desc: 'Sign up with your university email', color: '#3b82f6' },
  { icon: Edit3, title: 'Complete Profile', desc: 'Add your skills, goals, and interests', color: '#8b5cf6' },
  { icon: Handshake, title: 'Connect with Alumni', desc: 'Find mentors in your field', color: '#22d3ee' },
  { icon: MessageSquare, title: 'Join Community', desc: 'Engage in discussions and debates', color: '#34d399' },
  { icon: Target, title: 'Explore Opportunities', desc: 'Apply for jobs and research', color: '#f59e0b' },
  { icon: Rocket, title: 'Grow Your Career', desc: 'Build your professional network', color: '#fb923c' },
];

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = useCallback((idx) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  }, []);

  const filteredFaqs = searchQuery.trim()
    ? FAQS.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : FAQS;

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-[120px] sm:pt-[136px] pb-14 sm:pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 xl:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Support & Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Help Center
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              Find answers, get support, and learn how to make the most of Frontx.
            </p>
            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 xl:px-8 py-12 sm:py-16 space-y-16">

        {/* Quick Help Cards */}
        <section>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quick Help</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 mb-8">Browse common topics to find what you need fast.</motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_HELP.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-5 rounded-2xl"
                style={{
                  background: 'linear-gradient(145deg, #0f172a, #111827)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)',
                }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 mb-8">Quick answers to the most common questions.</motion.p>
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.03 }}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: openFaq === i ? 'linear-gradient(145deg, #0f172a, #111827)' : 'linear-gradient(145deg, #0f172a, #0f172a)',
                  border: openFaq === i ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(96,165,250,0.06)',
                  boxShadow: openFaq === i ? '0 12px 40px -8px rgba(59,130,246,0.1)' : '0 4px 20px -4px rgba(0,0,0,0.2)',
                }}>
                <button onClick={() => toggleFaq(i)}
                  className="w-full flex items-center gap-4 p-5 sm:p-6 text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: openFaq === i ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', border: openFaq === i ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(255,255,255,0.06)' }}>
                    <HelpCircle className="w-4 h-4" style={{ color: openFaq === i ? '#60a5fa' : '#64748b' }} strokeWidth={1.5} />
                  </div>
                  <span className="flex-1 text-[15px] font-semibold text-white">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-6 pt-0">
                        <div className="h-px w-full mb-4" style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.15), transparent)' }} />
                        <p className="text-[14px] text-slate-400 leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Getting Started</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 mb-8">Follow these steps to get the most out of Frontx.</motion.p>
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-[27px] sm:left-[31px] top-0 bottom-0 w-px hidden sm:block" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.2), rgba(251,191,36,0.2))' }} />
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-0">
              {STEPS.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-4 sm:gap-6 sm:py-5 relative">
                  <div className="relative z-10 shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
                      style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}>
                      <step.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: step.color }} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: step.color }}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Need More Help */}
        <section>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-3xl p-8 sm:p-10 text-center"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(96,165,250,0.08)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Send className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Contact Support</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Still Need Help?</h2>
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mx-auto mb-8">
              If you cannot find the answer you are looking for, contact the Frontx support team.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {[
                { icon: Mail, label: 'Support Email', value: 'support@frontx.com', c: '#3b82f6' },
                { icon: Phone, label: 'Contact Team', value: '+1 (800) FRONTX', c: '#10b981' },
                { icon: HelpCircle, label: 'Help Center', value: 'help.frontx.com', c: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <item.icon className="w-4 h-4" style={{ color: item.c }} strokeWidth={1.5} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${item.c}99` }}>{item.label}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/"
                className="px-7 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer Statement */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center pb-4">
          <p className="text-gray-500 text-sm">
            We're here to help you succeed throughout your academic and career journey.
          </p>
        </motion.div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default HelpCenterPage;
