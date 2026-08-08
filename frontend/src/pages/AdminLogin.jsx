import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import TurnstileWidget from '../component/TurnstileWidget';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2
} from 'lucide-react';
import logo from '../assets/logo/frontx-logo.svg';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const particlePositions = [
  { left: '10%', top: '15%', size: 3, delay: 0, duration: 7 },
  { left: '82%', top: '20%', size: 2, delay: 1.5, duration: 9 },
  { left: '25%', top: '78%', size: 2.5, delay: 0.8, duration: 6 },
  { left: '70%', top: '82%', size: 2, delay: 2.2, duration: 8 },
  { left: '48%', top: '6%', size: 1.5, delay: 3, duration: 10 },
  { left: '8%', top: '50%', size: 2, delay: 1, duration: 7.5 },
  { left: '88%', top: '58%', size: 1.8, delay: 0.5, duration: 8.5 },
  { left: '38%', top: '92%', size: 2.2, delay: 2.8, duration: 6.5 },
  { left: '62%', top: '30%', size: 1.5, delay: 1.8, duration: 9.5 },
  { left: '55%', top: '65%', size: 2, delay: 3.5, duration: 7 },
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    if (!turnstileToken) errs.turnstile = 'Please complete Cloudflare verification.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const result = await adminLogin(email, password, turnstileToken);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setErrors({ submit: result.error || 'Login failed. Please try again.' });
      setTurnstileToken('');
      setTurnstileResetKey(prev => prev + 1);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white py-12 px-4">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[#0F172A]/[0.02] rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-0">

          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] p-[1px]">

            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-purple-400/30" />

            <div className="relative rounded-[calc(2rem-1px)] overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.95) 35%, rgba(15,23,42,0.98) 65%, rgba(8,15,30,0.99) 100%)',
              }}>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    background: 'linear-gradient(110deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmerSweep 6s ease-in-out infinite',
                  }} />
                <div className="absolute inset-0 opacity-[0.025]"
                  style={{
                    background: 'linear-gradient(200deg, transparent 30%, rgba(99,102,241,0.4) 48%, rgba(168,85,247,0.5) 50%, rgba(99,102,241,0.4) 52%, transparent 70%)',
                    backgroundSize: '250% 100%',
                    animation: 'shimmerSweep 10s ease-in-out infinite 2s',
                  }} />
              </div>

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

              <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-[0.07] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,1), transparent 70%)' }} />

              <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-[0.06] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,1), transparent 70%)' }} />

              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

              <div className="relative z-10 p-8 sm:p-10 space-y-6">

                <motion.div variants={fadeUp} className="text-center space-y-4">
                  <div className="flex justify-center">
                    <img src={logo} alt="Frontx logo" className="w-16 h-16 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                      Authorized administrators only.
                    </p>
                  </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <motion.div variants={fadeUp} custom={1}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
                        placeholder="admin@example.com"
                        className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.email ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                    </div>
                    {errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5">{errors.email}</motion.p>}
                  </motion.div>

                  <motion.div variants={fadeUp} custom={2}>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                        placeholder="Enter your password"
                        className={`w-full pl-11 pr-12 py-3.5 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.password ? 'border-red-400/50' : 'border-white/[0.08]'}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5">{errors.password}</motion.p>}
                  </motion.div>

                  <motion.div variants={fadeUp} custom={3}>
                    <div className="flex justify-center min-h-[65px]">
                      <TurnstileWidget key={turnstileResetKey} onChange={setTurnstileToken} />
                    </div>
                    {errors.turnstile && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 text-center">{errors.turnstile}</motion.p>}
                  </motion.div>

                  {errors.submit && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 text-center">
                      {errors.submit}
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp} custom={4}>
                    <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                      ) : (
                        <><span>Sign In</span> <ArrowRight className="w-5 h-5" /></>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

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

export default AdminLogin;
