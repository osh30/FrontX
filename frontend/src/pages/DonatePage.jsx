import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Users, FlaskConical, Briefcase, Globe,
  ArrowRight, ArrowLeft, Shield, CheckCircle, Target,
  Rocket, Heart, ChevronRight, Lock
} from 'lucide-react';

const WHY_DONATE = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Student Learning Support',
    desc: 'Fund workshops, bootcamps, and hands-on skill-building programs for students.',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-300',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Resource Development',
    desc: 'Build and maintain premium learning resources, templates, and study materials.',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-300',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Alumni Mentorship Programs',
    desc: 'Expand alumni-student mentorship sessions and guidance programs.',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-300',
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    title: 'Research & Collaboration',
    desc: 'Support research projects and cross-university collaboration initiatives.',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-300',
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: 'Career Development Services',
    desc: 'Enhance job matching, resume reviews, and interview preparation tools.',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-300',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Platform Improvements',
    desc: 'Scale infrastructure, improve performance, and build new features.',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-300',
  },
];

const ROADMAP = [
  { title: 'Expand Mentorship Programs', desc: 'Connect more students with industry-leading alumni mentors.' },
  { title: 'Improve Learning Resources', desc: 'Build curated courses, templates, and interview prep materials.' },
  { title: 'Support Research Collaboration', desc: 'Enable cross-university research projects and publications.' },
  { title: 'Enhance AI-Powered Services', desc: 'Improve skill analysis, career matching, and personalized guidance.' },
  { title: 'Career Preparation Tools', desc: 'Build resume builders, mock interviews, and job tracking systems.' },
  { title: 'Platform Infrastructure', desc: 'Scale servers, improve performance, and ensure reliability.' },
  { title: 'New Student Opportunities', desc: 'Create scholarships, internships, and networking events.' },
];

const PAYMENT_METHODS = [
  { name: 'Visa', letters: 'VISA', color: '#1A1F71' },
  { name: 'Mastercard', letters: 'MC', color: '#EB001B' },
  { name: 'bKash', letters: 'bKash', color: '#E2136E' },
  { name: 'Nagad', letters: 'Nagad', color: '#F6921E' },
  { name: 'Rocket', letters: 'Rocket', color: '#E31837' },
  { name: 'DBBL', letters: 'DBBL', color: '#004B87' },
  { name: 'Brac Bank', letters: 'BRAC', color: '#E31837' },
  { name: 'City Bank', letters: 'CITY', color: '#00529B' },
];

const DonatePage = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Subtle background accents on white */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 xl:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium mb-10 transition-colors duration-300">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 mb-8"
          >
            <Heart className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-semibold text-blue-600 tracking-wide uppercase">Support FRONTX</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 80, damping: 18 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6"
          >
            Invest in Future{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Student Success
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 80, damping: 18 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Help us build a stronger student-alumni ecosystem through mentorship, learning resources, research opportunities, and career development.
          </motion.p>
        </div>
      </section>

      {/* ─── Why Donate ─── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Why Donate?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Every contribution directly supports student success and strengthens our community.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_DONATE.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i, type: 'spring', stiffness: 100, damping: 18 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative bg-[#1E293B] rounded-[22px] border border-white/[0.06] p-7 overflow-hidden transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(30,41,59,0.25)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none rounded-[22px]" />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} border border-white/[0.08] flex items-center justify-center mb-5 ${item.iconColor}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-[15px] mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Future Vision / Roadmap ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 xl:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200/60 mb-6">
              <Rocket className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[11px] font-semibold text-purple-600 tracking-wide uppercase">Future Vision</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              What Your Contribution Will Help Build
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">Donations fuel the next wave of improvements for students and alumni.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 via-purple-300 to-transparent hidden md:block" />

            <div className="space-y-4">
              {ROADMAP.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i, type: 'spring', stiffness: 100, damping: 18 }}
                  className="group relative flex items-start gap-5 md:pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[18px] top-5 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white shadow-[0_0_12px_rgba(99,102,241,0.25)] hidden md:block" />

                  <div className="flex-1 bg-[#1E293B] rounded-[18px] border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(30,41,59,0.2)]">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[11px] font-bold text-blue-400/60 tracking-wider">0{i + 1}</span>
                      <h4 className="text-white font-bold text-[15px]">{item.title}</h4>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed ml-8">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Authentication Requirement ─── */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-6 xl:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#23324A] rounded-[28px] border border-white/[0.08] shadow-[0_24px_64px_rgba(35,50,74,0.3)] overflow-hidden p-10 md:p-14 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none rounded-[28px]" />
            <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }} />

            {/* Glow behind */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-white/[0.08] flex items-center justify-center mx-auto mb-7">
                <Target className="w-8 h-8 text-blue-300" strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                Account Required
              </h2>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400/10 border border-amber-300/15 mb-8">
                <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <p className="text-sm text-amber-100/80 font-medium">
                  To make a donation, you must first sign in or create a Frontx account.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/login"
                  className="group px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-[0_6px_28px_rgba(59,130,246,0.35)] hover:shadow-[0_10px_44px_rgba(59,130,246,0.45)] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.03]"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-white/[0.08] text-white/80 font-semibold rounded-xl border border-white/[0.12] hover:bg-white/[0.14] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Create Account
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Payment Methods — SSLCommerz Banner ─── */}
      <section className="pb-8 relative">
        <div className="max-w-6xl mx-auto px-6 xl:px-8 relative z-10">
          <div
            className="relative rounded-[24px] overflow-hidden shadow-[0_12px_48px_rgba(15,23,42,0.18)]"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
          >
            {/* Subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            {/* Inner glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-blue-500/[0.07] rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 px-8 py-7">

              {/* Left — Pay With */}
              <div className="flex items-center gap-5 shrink-0">
                <Lock className="w-4 h-4 text-blue-400/60" strokeWidth={1.5} />
                <span className="text-white font-bold text-[15px] tracking-wide whitespace-nowrap">Pay With</span>
              </div>

              {/* Divider — desktop */}
              <div className="hidden md:block w-px h-8 bg-white/[0.12] mx-6 shrink-0" />

              {/* Center — Payment Logos */}
              <div className="flex flex-wrap items-center justify-center gap-3 flex-1">
                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.name}
                    className="flex items-center justify-center bg-white rounded-lg h-10 min-w-[72px] px-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  >
                    <span
                      className="text-[11px] font-extrabold tracking-wider"
                      style={{ color: pm.color }}
                    >
                      {pm.letters}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider — desktop */}
              <div className="hidden md:block w-px h-8 bg-white/[0.12] mx-6 shrink-0" />

              {/* Right — Verified by SSLCommerz */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-white/60 text-[11px] font-medium whitespace-nowrap hidden sm:inline">Verified by</span>
                <div className="flex items-center justify-center bg-white/[0.08] border border-white/[0.1] rounded-lg h-10 px-3">
                  <span className="text-[10px] font-bold text-white/80 tracking-wider">SSL</span>
                  <span className="text-[10px] font-bold text-blue-400 tracking-wider ml-0.5">Commerz</span>
                </div>
              </div>
            </div>

            {/* Bottom highlight */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            Secured by SSLCommerz — Bangladesh's leading payment gateway.
          </p>
        </div>
      </section>

      {/* ─── Trust Banner ─── */}
      <section className="pb-24 relative">
        <div className="max-w-4xl mx-auto px-6 xl:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#243B55] rounded-[22px] border border-white/[0.08] px-8 py-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.06] via-transparent to-purple-500/[0.06] pointer-events-none rounded-[22px]" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <div className="w-11 h-11 rounded-full bg-blue-500/15 border border-white/[0.08] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                <span className="text-white font-semibold">Every contribution helps create better opportunities</span> for current and future students.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DonatePage;
