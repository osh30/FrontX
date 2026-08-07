import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import TurnstileWidget from '../component/TurnstileWidget';
import {
  User, GraduationCap, Mail, Lock, Eye, EyeOff,
  ArrowRight, Loader2, CheckCircle2, BookOpen, IdCard, Users,
  Briefcase, Building2, Globe, MapPin
} from 'lucide-react';
import logo from '../assets/logo/frontx-logo.svg';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Currently enrolled' },
  { id: 'alumni', label: 'Alumni', icon: Users, desc: 'Graduated' },
  { id: 'recruiter', label: 'Recruiter', icon: Briefcase, desc: 'Hire talent' },
];

const DEPARTMENTS = ['Educational Technology and Engineering'];

const INDUSTRY_TYPES = [
  'Technology / IT',
  'Finance / Banking',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail / E-Commerce',
  'Media / Entertainment',
  'Telecommunications',
  'Construction / Real Estate',
  'Automotive',
  'Energy / Utilities',
  'Consulting / Professional Services',
  'Government / Public Sector',
  'Non-Profit / NGO',
  'Other',
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const particlePositions = [
  { left: '8%', top: '12%', size: 3, delay: 0, duration: 7 },
  { left: '85%', top: '18%', size: 2, delay: 1.5, duration: 9 },
  { left: '22%', top: '75%', size: 2.5, delay: 0.8, duration: 6 },
  { left: '72%', top: '80%', size: 2, delay: 2.2, duration: 8 },
  { left: '50%', top: '8%', size: 1.5, delay: 3, duration: 10 },
  { left: '15%', top: '45%', size: 2, delay: 1, duration: 7.5 },
  { left: '90%', top: '55%', size: 1.8, delay: 0.5, duration: 8.5 },
  { left: '35%', top: '90%', size: 2.2, delay: 2.8, duration: 6.5 },
  { left: '65%', top: '35%', size: 1.5, delay: 1.8, duration: 9.5 },
  { left: '5%', top: '65%', size: 2, delay: 3.5, duration: 7 },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(() => (searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student'));
  const [form, setForm] = useState({ name: '', nickname: '', email: '', session: '', department: 'Educational Technology and Engineering', password: '', confirmPassword: '', companyName: '', designation: '', industryType: '', companyWebsite: '', companyAddress: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!agreed) errs.agreed = 'Please accept the Terms & Conditions.';
    if (!turnstileToken) errs.turnstile = 'Please complete Cloudflare verification.';

    // Student/Alumni specific validation
    if (role === 'student' || role === 'alumni') {
      if (!form.session.trim()) errs.session = 'Session is required.';
      if (form.email && !form.email.toLowerCase().endsWith('@std.uftb.ac.bd')) {
        errs.email = 'Please use your official UFTB student email address (@std.uftb.ac.bd).';
      }
    }

    // Recruiter specific validation
    if (role === 'recruiter') {
      if (!form.companyName.trim()) errs.companyName = 'Company name is required.';
      if (!form.designation.trim()) errs.designation = 'Designation is required.';
      if (!form.industryType) errs.industryType = 'Please select an industry type.';
      // ──────────────────────────────────────────────────────
      // DEMO MODE: any valid email is accepted.
      // PRODUCTION: add official company domain validation here.
      // ──────────────────────────────────────────────────────
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const payload = { name: form.name, email: form.email, password: form.password, role };

    // Include student/alumni fields when applicable
    if (role === 'student' || role === 'alumni') {
      payload.session = form.session;
      payload.department = form.department;
    }

    // Include recruiter-specific fields
    if (role === 'recruiter') {
      payload.companyName = form.companyName;
      payload.designation = form.designation;
      payload.industryType = form.industryType;
      payload.companyWebsite = form.companyWebsite;
      payload.companyAddress = form.companyAddress;
    }

    payload.turnstileToken = turnstileToken;

    const result = await register(payload);
    if (result.success) {
      // Route to the appropriate dashboard based on role
      const dashboardMap = { student: '/dashboard/student', alumni: '/dashboard/alumni', recruiter: '/dashboard/recruiter' };
      navigate(dashboardMap[result.role] || '/dashboard/student');
    } else {
      setErrors({ submit: result.error || 'Registration failed. Please try again.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white py-12 px-4">

      {/* Subtle ambient blobs on white background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[#0F172A]/[0.02] rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[540px]">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-0">

          {/* ─── Main Glassmorphism Card ─── */}
          <motion.div variants={fadeUp}
            className="relative overflow-hidden rounded-[2rem] p-[1px]">

            {/* Gradient border ring */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-purple-400/30" />

            {/* Inner card */}
            <div className="relative rounded-[calc(2rem-1px)] overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.95) 35%, rgba(15,23,42,0.98) 65%, rgba(8,15,30,0.99) 100%)',
              }}>

              {/* ── Glitter / Shimmer overlays ── */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Main shimmer sweep */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    background: 'linear-gradient(110deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmerSweep 6s ease-in-out infinite',
                  }} />
                {/* Secondary slow shimmer */}
                <div className="absolute inset-0 opacity-[0.025]"
                  style={{
                    background: 'linear-gradient(200deg, transparent 30%, rgba(99,102,241,0.4) 48%, rgba(168,85,247,0.5) 50%, rgba(99,102,241,0.4) 52%, transparent 70%)',
                    backgroundSize: '250% 100%',
                    animation: 'shimmerSweep 10s ease-in-out infinite 2s',
                  }} />
              </div>

              {/* ── Floating particles ── */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particlePositions.map((p, i) => (
                  <div key={i}
                    className="absolute rounded-full"
                    style={{
                      left: p.left,
                      top: p.top,
                      width: p.size,
                      height: p.size,
                      background: i % 3 === 0
                        ? 'radial-gradient(circle, rgba(168,163,175,0.7), transparent)'
                        : i % 3 === 1
                          ? 'radial-gradient(circle, rgba(129,140,248,0.6), transparent)'
                          : 'radial-gradient(circle, rgba(196,181,253,0.5), transparent)',
                      animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
                    }} />
                ))}
              </div>

              {/* ── Top-left glow accent ── */}
              <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-[0.07] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,1), transparent 70%)' }} />

              {/* ── Bottom-right glow accent ── */}
              <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-[0.06] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,1), transparent 70%)' }} />

              {/* ── Glass highlight (top edge) ── */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

              {/* ── Content ── */}
              <div className="relative z-10 p-8 sm:p-10 space-y-6">

                {/* Header */}
                <motion.div variants={fadeUp} className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-3">
                      <img src={logo} alt="Frontx logo" className="w-12 h-12 object-contain" />
                      <span className="text-3xl font-bold text-white tracking-tight">FrontX</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                      Join the Frontx community and connect with students and alumni.
                    </p>
                  </div>
                </motion.div>

                {/* Role Selection */}
                <motion.div variants={fadeUp} custom={1} className={`grid ${ROLES.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const active = role === r.id;
                    return (
                      <button key={r.id} type="button" onClick={() => { setRole(r.id); setErrors({}); }}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-center group ${
                          active
                            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-slate-300'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all ${
                          active ? 'bg-blue-500/20' : 'bg-white/[0.06] group-hover:bg-white/[0.08]'
                        }`}>
                          <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                        </div>
                        <p className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{r.label}</p>
                        <p className={`text-[10px] mt-0.5 ${active ? 'text-blue-300/70' : 'text-slate-500'}`}>{r.desc}</p>
                      </button>
                    );
                  })}
                </motion.div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Full Name */}
                  <motion.div variants={fadeUp} custom={3}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name"
                        className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.name ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                    </div>
                    <AnimatePresence>{errors.name && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.name}</motion.p>}</AnimatePresence>
                  </motion.div>

                  {/* Nickname */}
                  <motion.div variants={fadeUp} custom={4}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nickname</label>
                    <div className="relative">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="text" name="nickname" value={form.nickname} onChange={handleChange} placeholder="Your display name"
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40" />
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fadeUp} custom={5}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                        className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.email ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                    </div>
                    <AnimatePresence>{errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.email}</motion.p>}</AnimatePresence>
                  </motion.div>

                  {/* Session & Department — Student / Alumni only */}
                  {(role === 'student' || role === 'alumni') && (
                    <div className="space-y-5">
                      <motion.div variants={fadeUp} custom={6}>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Session</label>
                            <div className="relative">
                              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input type="text" name="session" value={form.session} onChange={handleChange} placeholder="e.g. 2020-21"
                                className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.session ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                            </div>
                            <AnimatePresence>{errors.session && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.session}</motion.p>}</AnimatePresence>
                          </motion.div>

                          <motion.div variants={fadeUp} custom={7}>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Department</label>
                            <div className="relative">
                              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <select name="department" value={form.department} onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 appearance-none cursor-pointer">
                                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800 text-white">{d}</option>)}
                              </select>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Company Information — Recruiter only */}
                  {role === 'recruiter' && (
                    <div className="space-y-5">
                      {/* Section divider */}
                      <motion.div variants={fadeUp} custom={5.5}>
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Company Information</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
                        </div>
                      </motion.div>

                      {/* Company Name */}
                      <motion.div variants={fadeUp} custom={6}>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Company Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Acme Corp"
                            className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.companyName ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                        </div>
                        <AnimatePresence>{errors.companyName && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.companyName}</motion.p>}</AnimatePresence>
                      </motion.div>

                      {/* Designation / Job Title */}
                      <motion.div variants={fadeUp} custom={7}>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Designation / Job Title</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input type="text" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Senior HR Manager"
                            className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.designation ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                        </div>
                        <AnimatePresence>{errors.designation && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.designation}</motion.p>}</AnimatePresence>
                      </motion.div>

                      {/* Industry Type */}
                      <motion.div variants={fadeUp} custom={8}>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Industry Type</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <select name="industryType" value={form.industryType} onChange={handleChange}
                            className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 appearance-none cursor-pointer ${errors.industryType ? 'border-red-400/50' : 'border-white/[0.08]'}`}>
                            <option value="" className="bg-slate-800 text-white">Select industry</option>
                            {INDUSTRY_TYPES.map(ind => <option key={ind} value={ind} className="bg-slate-800 text-white">{ind}</option>)}
                          </select>
                        </div>
                        <AnimatePresence>{errors.industryType && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.industryType}</motion.p>}</AnimatePresence>
                      </motion.div>

                      {/* Company Website (Optional) */}
                      <motion.div variants={fadeUp} custom={9}>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Company Website</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input type="url" name="companyWebsite" value={form.companyWebsite} onChange={handleChange} placeholder="https://example.com"
                            className="w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40" />
                        </div>
                      </motion.div>

                      {/* Company Address (Optional) */}
                      <motion.div variants={fadeUp} custom={10}>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Company Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input type="text" name="companyAddress" value={form.companyAddress} onChange={handleChange} placeholder="e.g. Dhaka, Bangladesh"
                            className="w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40" />
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Password */}
                  <motion.div variants={fadeUp} custom={8}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                        className={`w-full pl-11 pr-12 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.password ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <AnimatePresence>{errors.password && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.password}</motion.p>}</AnimatePresence>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={fadeUp} custom={9}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password"
                        className={`w-full pl-11 pr-12 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.confirmPassword ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <AnimatePresence>{errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</motion.p>}</AnimatePresence>
                  </motion.div>

                  {/* Terms & Conditions */}
                  <motion.div variants={fadeUp} custom={10}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input type="checkbox" checked={agreed} onChange={() => { setAgreed(!agreed); setErrors(prev => ({ ...prev, agreed: '' })); }} className="sr-only peer" />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                          {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <span className="text-sm text-slate-400 leading-relaxed">
                        I agree to the{' '}
                        <span className="font-semibold text-blue-400 cursor-pointer hover:underline">Terms of Service</span>
                        {' '}and{' '}
                        <span className="font-semibold text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>
                      </span>
                    </label>
                    <AnimatePresence>{errors.agreed && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5 ml-8">{errors.agreed}</motion.p>}</AnimatePresence>
                    <p className="text-[11px] text-slate-500 mt-2 ml-8">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                  </motion.div>

                  {/* Cloudflare Turnstile */}
                  <motion.div variants={fadeUp} custom={11}>
                    <div className="flex justify-center min-h-[65px]">
                      <TurnstileWidget onChange={setTurnstileToken} />
                    </div>
                    <AnimatePresence>{errors.turnstile && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5 text-center">{errors.turnstile}</motion.p>}</AnimatePresence>
                  </motion.div>

                  {/* Submit Error */}
                  <AnimatePresence>{errors.submit && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 text-center">
                      {errors.submit}
                    </motion.div>
                  )}</AnimatePresence>

                  {/* Submit Button */}
                  <motion.div variants={fadeUp} custom={12}>
                    <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
                      ) : (
                        <><span>Create Account</span> <ArrowRight className="w-5 h-5" /></>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Footer - Sign In link */}
                <motion.div variants={fadeUp} custom={13} className="text-center pt-2">
                  <p className="text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">Sign In</Link>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
          {/* ─── End Main Card ─── */}

        </motion.div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
          25% { transform: translateY(-12px) translateX(4px) scale(1.3); opacity: 0.7; }
          50% { transform: translateY(-6px) translateX(-3px) scale(0.9); opacity: 0.5; }
          75% { transform: translateY(-16px) translateX(6px) scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Register;
