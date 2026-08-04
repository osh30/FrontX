import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Eye, Database, UserCheck, BookOpen, MessageSquare,
  Briefcase, FileText, Settings, Trash2, Download, ChevronDown,
  CheckCircle2, AlertTriangle, Users, Heart, Ban, Flag, Mail,
  HelpCircle, Phone, Globe, ArrowRight, Sparkles, Network,
  Server, Key, ShieldCheck, Fingerprint, Cloud, Send,
  GraduationCap, Award, Search, TrendingUp, Lightbulb, Rocket,
  Menu, X
} from 'lucide-react';
import LandingNavbar from './Landing/LandingNavbar';
import LandingFooter from './Landing/LandingFooter';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />
      <main>
        <HeroSection />
        <InfoWeCollect />
        <DataProtection />
        <HowWeUseInfo />
        <UserRights />
        <CommunitySafety />
        <PrivacyCommitments />
        <ContactSupport />
        <TrustFooter />
      </main>
      <LandingFooter />
    </div>
  );
};

const FloatingParticle = ({ delay, x, y, size }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      left: `${x}%`, top: `${y}%`, width: size, height: size,
      background: 'radial-gradient(circle, rgba(96,165,250,0.4), transparent)',
    }}
    animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
    transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

function HeroSection() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 3 + Math.random() * 5, delay: Math.random() * 3,
  }));

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-[100px]"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1529 30%, #111d3a 60%, #0a1628 100%)' }}>
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      {particles.map(p => <FloatingParticle key={p.id} {...p} />)}

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 xl:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
              style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)' }}>
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Privacy & Security</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Privacy &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                Data Protection
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg mb-10">
              Your privacy matters. Learn how Frontx collects, protects, and uses your information to create a secure university ecosystem.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#information-we-collect"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                Learn More
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link to="/"
                className="px-8 py-4 border border-white/15 text-white rounded-2xl font-semibold text-lg hover:bg-white/5 transition-all duration-300 flex items-center gap-2">
                Back to Home
              </Link>
            </div>

            <p className="text-sm text-slate-500 mt-8">Last updated: July 2026</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center">
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[480px] aspect-square mx-auto">
      <div className="absolute inset-0 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,27,50,0.6))', border: '1px solid rgba(96,165,250,0.1)' }} />
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6">
              <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#06b6d4;#3b82f6" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8b5cf6">
              <animate attributeName="stop-color" values="#8b5cf6;#06b6d4;#3b82f6;#8b5cf6" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="heroGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {[1,2,3,4].map(i => (
          <circle key={i} cx="200" cy="200" r={60 + i * 35} fill="none" stroke="url(#shieldGrad)"
            strokeWidth="0.5" opacity={0.15 - i * 0.02}>
            <animateTransform attributeName="transform" type="rotate"
              from={`0 200 200`} to={`${i % 2 === 0 ? 360 : -360} 200 200`}
              dur={`${20 + i * 5}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {[
          { x: 200, y: 100 }, { x: 280, y: 140 }, { x: 300, y: 220 },
          { x: 260, y: 300 }, { x: 140, y: 300 }, { x: 100, y: 220 }, { x: 120, y: 140 },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#60a5fa" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2">
              <animate attributeName="r" values="12;18;12" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {[[200,100,280,140],[280,140,300,220],[300,220,260,300],[260,300,140,300],
          [140,300,100,220],[100,220,120,140],[120,140,200,100],[200,100,200,200],
          [280,140,200,200],[300,220,200,200],[260,300,200,200],[140,300,200,200]].map(([x1,y1,x2,y2], i) => (
          <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="0.5" opacity="0.12">
            <animate attributeName="opacity" values="0.08;0.2;0.08" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl opacity-40" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', filter: 'blur(30px)' }} />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(96,165,250,0.3)', backdropFilter: 'blur(20px)' }}>
              <Shield className="w-14 h-14 sm:w-16 sm:h-16 text-blue-300" strokeWidth={1.2} />
            </div>
          </div>
        </motion.div>
      </div>

      {[{ icon: Lock, x: '15%', y: '25%', delay: 0 }, { icon: Key, x: '80%', y: '20%', delay: 0.5 },
        { icon: Eye, x: '85%', y: '70%', delay: 1 }, { icon: Fingerprint, x: '12%', y: '75%', delay: 1.5 },
      ].map(({ icon: Icon, x, y, delay }, i) => (
        <motion.div key={i} className="absolute" style={{ left: x, top: y }}
          animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(96,165,250,0.15)', backdropFilter: 'blur(8px)' }}>
            <Icon className="w-5 h-5 text-blue-400/70" strokeWidth={1.5} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const collectItems = [
  { icon: UserCheck, title: 'Profile Information', color: '#3b82f6',
    desc: 'When you create a Frontx account, we collect your name, email address, profile picture, and university affiliation. This helps us verify your identity and connect you with the right community members within your academic network.' },
  { icon: GraduationCap, title: 'Academic Information', color: '#8b5cf6',
    desc: 'We store your academic details such as your major, graduation year, GPA range, and coursework interests. This information powers our matching algorithms and helps mentors understand your educational background when offering guidance.' },
  { icon: MessageSquare, title: 'Mentorship Activity', color: '#06b6d4',
    desc: 'Your mentorship session history, feedback ratings, and communication patterns within the platform are recorded. This data helps us improve matching quality and ensure productive mentorship experiences for both students and alumni.' },
  { icon: BookOpen, title: 'Resource Contributions', color: '#10b981',
    desc: 'Resources you upload, share, or save including study materials, career guides, and research papers are stored on our secure servers. We track engagement metrics to surface the most valuable content to other community members.' },
  { icon: MessageSquare, title: 'Community Interactions', color: '#f59e0b',
    desc: 'Posts, comments, reactions, and direct messages within the Frontx community are processed to maintain a safe and collaborative environment. We analyze interaction patterns to improve content recommendations and community features.' },
  { icon: Briefcase, title: 'Career Activity', color: '#ef4444',
    desc: 'Job applications, saved positions, career interest preferences, and networking activity are tracked to personalize your job feed and connect you with relevant opportunities posted by alumni and partner organizations.' },
];

function InfoWeCollect() {
  return (
    <section id="information-we-collect" className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16 sm:mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Data Collection</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Information We Collect
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
            Frontx collects only the data necessary to provide you with a personalized, secure, and productive university ecosystem experience.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectItems.map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative p-7 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
                style={{ background: `radial-gradient(circle, ${item.color}, transparent)`, transform: 'translate(30%, -30%)' }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                <item.icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const protectionItems = [
  { icon: ShieldCheck, label: 'Encrypted Storage', desc: 'All personal data is encrypted at rest using AES-256 encryption. Your information is stored in secure, SOC 2 compliant data centers with multiple layers of physical and digital security.' },
  { icon: Key, label: 'Secure Authentication', desc: 'We use industry-standard OAuth 2.0 and JWT token-based authentication. Multi-factor authentication is available for all accounts to add an extra layer of security.' },
  { icon: UserCheck, label: 'Protected User Accounts', desc: 'Each user account is isolated with role-based access controls. Your data is only accessible by you and authorized platform features that you explicitly permit.' },
  { icon: Lock, label: 'Restricted Access', desc: 'Frontx employees follow strict data access protocols. Only authorized personnel can access user data, and all access is logged, audited, and reviewed regularly.' },
  { icon: Cloud, label: 'Cloud Security', desc: 'Our infrastructure runs on enterprise-grade cloud providers with built-in redundancy, automated backups, DDoS protection, and real-time threat monitoring systems.' },
  { icon: Send, label: 'Safe Communication', desc: 'All messages and communications on Frontx are transmitted over TLS 1.3 encrypted connections. We do not read, sell, or share private conversations between users.' },
];

function DataProtection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1529 40%, #111d3a 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16 sm:mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Security</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            How We Protect Your Data
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
            Security is foundational to Frontx. We employ multiple layers of protection to safeguard your personal information.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {protectionItems.map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group relative p-7 rounded-3xl"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(96,165,250,0.08)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))' }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <item.icon className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const usageSteps = [
  { icon: Database, title: 'User Information', desc: 'We collect your basic profile and academic data to establish your identity within the Frontx ecosystem and personalize your experience.', color: '#3b82f6' },
  { icon: Server, title: 'Platform Services', desc: 'Your data powers core platform features including community feeds, resource libraries, and the alumni directory that keeps our ecosystem connected.', color: '#8b5cf6' },
  { icon: Lightbulb, title: 'Recommendations', desc: 'We analyze your interests and activity patterns to suggest relevant resources, articles, and community content tailored to your academic and career goals.', color: '#06b6d4' },
  { icon: Users, title: 'Mentorship Matching', desc: 'Academic background and career interests are used to create meaningful mentor-student pairings that maximize the value of every mentorship session.', color: '#10b981' },
  { icon: BookOpen, title: 'Learning Experience', desc: 'Session feedback and learning patterns help us improve the quality of mentorship sessions and recommend the most effective learning pathways for your growth.', color: '#f59e0b' },
  { icon: Rocket, title: 'Career Growth', desc: 'Career preferences and skill assessments enable us to surface job opportunities, internships, and networking connections aligned with your professional aspirations.', color: '#ef4444' },
];

function HowWeUseInfo() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16 sm:mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Data Usage</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            How Frontx Uses Your Information
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
            Every piece of data you share serves a specific purpose: making your university journey more connected, informed, and rewarding.
          </motion.p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.2), rgba(59,130,246,0.2), transparent)' }} />

          {usageSteps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex items-center gap-8 mb-12 last:mb-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
              
              <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                <div className={`inline-block p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-500 max-w-md ${i % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${step.color}12`, border: `1px solid ${step.color}20` }}>
                      <step.icon className="w-5 h-5" style={{ color: step.color }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              <div className="hidden lg:flex relative z-10 w-12 h-12 rounded-full items-center justify-center shrink-0"
                style={{ background: `${step.color}15`, border: `2px solid ${step.color}30` }}>
                <span className="text-sm font-bold" style={{ color: step.color }}>{i + 1}</span>
              </div>

              <div className="flex-1 hidden lg:block" />
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="lg:hidden flex justify-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <ArrowRight className="w-4 h-4 text-blue-600 rotate-90" />
              <span className="text-sm font-medium text-blue-700">Data flows through each step</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const rights = [
  { icon: Eye, title: 'View Your Data', color: '#3b82f6',
    desc: 'You can access a complete overview of all personal data Frontx stores about you at any time. Visit your dashboard settings to view your profile data, activity history, and stored preferences in a clear, organized format.' },
  { icon: Settings, title: 'Update Your Profile', color: '#8b5cf6',
    desc: 'Keep your information accurate and up to date. You can modify your profile details, academic information, career preferences, and privacy settings directly from your account dashboard without contacting support.' },
  { icon: Trash2, title: 'Delete Your Information', color: '#ef4444',
    desc: 'You have the right to request complete deletion of your account and all associated data. When you delete your account, all personal information, posts, and activity history are permanently removed from our servers within 30 days.' },
  { icon: Shield, title: 'Manage Privacy Settings', color: '#10b981',
    desc: 'Control exactly who sees what on your profile. Adjust visibility for your email, academic details, mentorship availability, and career information. You decide how much of your profile is visible to other community members.' },
  { icon: Download, title: 'Download Personal Data', color: '#f59e0b',
    desc: 'Export a portable copy of all your Frontx data at any time. Request a data download and receive a structured file containing your profile, posts, resources, mentorship history, and career activity in a standard format.' },
];

function UserRights() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16 sm:mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Your Rights</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            You're In Control
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
            Frontx gives you full transparency and control over your personal data. These rights are available to every user at all times.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rights.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`group relative p-7 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 ${i === 4 ? 'sm:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                <item.icon className="w-7 h-7" style={{ color: item.color }} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ color: item.color }}>
                <span>Access now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const safetyItems = [
  { icon: Heart, label: 'Respectful Communication', desc: 'All interactions on Frontx must be conducted with professionalism and respect. We foster an inclusive environment where every student, alumni, and mentor feels valued and heard.', color: '#ef4444' },
  { icon: Ban, label: 'No Harassment', desc: 'Harassment, bullying, intimidation, or any form of threatening behavior is strictly prohibited. Our automated systems and community moderators work together to identify and address violations quickly.', color: '#f97316' },
  { icon: AlertTriangle, label: 'No Spam', desc: 'Unsolicited promotional content, repetitive messaging, and automated posting are not allowed. We maintain feed quality so that every piece of content you see is relevant and valuable to your journey.', color: '#eab308' },
  { icon: Flag, label: 'No Harmful Content', desc: 'Content that promotes violence, discrimination, illegal activities, or is otherwise harmful to community members is immediately removed. We review flagged content within 24 hours of receiving a report.', color: '#a855f7' },
  { icon: MessageSquare, label: 'Reporting System', desc: 'Users can report inappropriate content, profiles, or behavior directly from any page on the platform. Reports are reviewed by our trust and safety team with strict confidentiality and fair investigation procedures.', color: '#3b82f6' },
  { icon: Users, label: 'Community Moderation', desc: 'Trusted community members and alumni moderators help maintain platform quality. Combined with AI-powered content screening, our moderation system ensures a safe and productive environment for everyone.', color: '#10b981' },
];

function CommunitySafety() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16 sm:mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 mb-6">
            <Shield className="w-4 h-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">Community Safety</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Built for Safe Collaboration
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
            A thriving community depends on trust. Frontx enforces clear guidelines to ensure every interaction is safe, respectful, and productive.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyItems.map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group relative p-7 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}10`, border: `1px solid ${item.color}18` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const commitments = [
  { text: 'We never sell personal information to third parties or use it for targeted advertising purposes.' },
  { text: 'Students have full control over their own content and can remove it at any time without restrictions.' },
  { text: 'Users manage their own profile visibility and decide exactly what information is shared with others.' },
  { text: 'We employ industry-leading secure storage practices with encryption, regular audits, and compliance certifications.' },
  { text: 'Transparent data usage means we clearly communicate how your information is collected, processed, and stored.' },
];

function PrivacyCommitments() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1529 40%, #111d3a 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">Our Promises</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Privacy Commitments
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
            These are the principles that guide every decision we make about your data at Frontx.
          </motion.p>
        </motion.div>

        <div className="space-y-4">
          {commitments.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-start gap-5 p-6 sm:p-7 rounded-2xl"
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(96,165,250,0.08)', backdropFilter: 'blur(12px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              </div>
              <p className="text-base text-slate-300 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const contactMethods = [
  { icon: Mail, title: 'Privacy Questions', detail: 'privacy@frontx.com', desc: 'For specific questions about how your data is handled, our privacy team responds within 2 business days with detailed answers.', color: '#3b82f6' },
  { icon: HelpCircle, title: 'Support Email', detail: 'support@frontx.com', desc: 'General support inquiries, account issues, and technical questions are handled by our dedicated support team available Monday through Friday.', color: '#8b5cf6' },
  { icon: Phone, title: 'Contact Team', detail: '+1 (800) FRONTX', desc: 'For urgent privacy concerns or data breach reports, reach our specialized trust and safety team directly by phone during business hours.', color: '#06b6d4' },
  { icon: Globe, title: 'Help Center', detail: 'help.frontx.com', desc: 'Browse our comprehensive knowledge base with step-by-step guides, privacy FAQs, data management tutorials, and platform documentation.', color: '#10b981' },
];

function ContactSupport() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 xl:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={stagger} className="text-center mb-16 sm:mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Get in Touch</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Contact & Support
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
            Have questions about your privacy? Our team is here to help with any concerns about your data or account security.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={stagger} className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {contactMethods.map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group relative p-7 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm font-semibold mb-2" style={{ color: item.color }}>{item.detail}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrustFooter() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1529 40%, #111d3a 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 xl:px-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          
          <div className="relative inline-block mb-10">
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', filter: 'blur(30px)', transform: 'scale(2)' }} />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(96,165,250,0.2)' }}>
              <Shield className="w-12 h-12 sm:w-14 sm:h-14 text-blue-300" strokeWidth={1.2} />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Your Trust Is Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
              Responsibility
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12">
            Frontx is committed to protecting every student, alumni, and mentor while creating a secure and collaborative university ecosystem. Your trust drives everything we build.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              Join Frontx
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/"
              className="px-8 py-4 border border-white/15 text-white rounded-2xl font-semibold text-lg hover:bg-white/5 transition-all duration-300">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PrivacyPage;
