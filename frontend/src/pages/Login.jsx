import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, Briefcase } from 'lucide-react';
import TurnstileWidget from '../component/TurnstileWidget';
import logo from '../assets/logo/frontx-logo.svg';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Currently enrolled' },
  { id: 'alumni', label: 'Alumni', icon: Users, desc: 'Graduated' },
  { id: 'recruiter', label: 'Recruiter', icon: Briefcase, desc: 'Hire talent' },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetSuccess, setResetSuccess] = useState(location.state?.resetSuccess || false);

  const validateEmail = (value, role) => {
    if (!value) return '';
    if (role === 'student' || role === 'alumni') {
      if (!value.endsWith('@std.uftb.ac.bd')) {
        return 'Please use your official university student email (@std.uftb.ac.bd).';
      }
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
    const emailErr = validateEmail(value, selectedRole);
    if (emailErr) setErrors(prev => ({ ...prev, email: emailErr }));
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setErrors({});
    if (email) {
      const emailErr = validateEmail(email, roleId);
      if (emailErr) setErrors({ email: emailErr });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else {
      const emailErr = validateEmail(email, selectedRole);
      if (emailErr) newErrors.email = emailErr;
    }
    if (!password) newErrors.password = 'Password is required';
    if (!turnstileToken) newErrors.turnstile = 'Please complete the security check.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(email, password, selectedRole, turnstileToken);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ submit: result.error || 'Login failed. Please try again.' });
    }
    setIsLoading(false);
  };

  const emailPlaceholder = selectedRole === 'recruiter'
    ? 'Enter your email address'
    : 'Enter your university email';

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float-slower"></div>
      </div>

      <div className="max-w-md w-full mx-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-[1px] shadow-2xl"
        >
          {/* Gradient border ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-purple-400/30" />

          {/* Inner navy card */}
          <div
            className="relative rounded-[calc(1.5rem-1px)] overflow-hidden p-8"
            style={{
              background: 'linear-gradient(165deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.95) 35%, rgba(15,23,42,0.98) 65%, rgba(8,15,30,0.99) 100%)',
            }}
          >
            {/* Glow accents */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-[0.07] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,1), transparent 70%)' }} />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-[0.06] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,1), transparent 70%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <img src={logo} alt="Frontx logo" className="w-12 h-12 object-contain" />
                    <span className="text-2xl font-bold text-white">FrontX</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Sign in to continue your journey</p>
              </div>

              {resetSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-300 text-sm rounded-xl border border-emerald-500/20 text-center mb-5">
                  Password reset successful! Please sign in with your new password.
                </div>
              )}

              {/* Role Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = selectedRole === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => handleRoleChange(r.id)}
                      className={`relative p-3 rounded-2xl border-2 transition-all duration-300 text-center group ${
                        active
                          ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50 shadow-lg shadow-blue-500/10'
                          : 'bg-white/[0.04] border-white/[0.08] text-slate-500 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-slate-300'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center transition-all ${
                        active ? 'bg-blue-500/20' : 'bg-white/[0.06] group-hover:bg-white/[0.08]'
                      }`}>
                        <Icon className={`w-4.5 h-4.5 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                      </div>
                      <p className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{r.label}</p>
                      <p className={`text-[10px] mt-0.5 ${active ? 'text-blue-300/70' : 'text-slate-500'}`}>{r.desc}</p>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.08] text-white placeholder:text-slate-500 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-red-400 text-xs mt-1.5">{errors.email}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.08] text-white placeholder:text-slate-500 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-red-400 text-xs mt-1.5">{errors.password}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition">Forgot Password?</Link>
                </div>

                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 text-center"
                    >
                      {errors.submit}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cloudflare Turnstile */}
                <div>
                  <div className="flex justify-center min-h-[65px]">
                    <TurnstileWidget onChange={setTurnstileToken} />
                  </div>
                  <AnimatePresence>
                    {errors.turnstile && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-red-400 text-xs mt-1.5 text-center">{errors.turnstile}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 text-white font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="text-center pt-4">
                  <p className="text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-400 hover:opacity-80 transition">
                      Create Account
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
