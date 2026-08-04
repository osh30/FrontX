import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import TurnstileWidget from '../component/TurnstileWidget';

const API_URL = 'http://localhost:5000/api';

const STEPS = ['Email', 'OTP', 'New Password'];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!turnstileToken) errs.turnstile = 'Please complete the security check.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsLoading(true);
    setErrors({});
    setSuccessMsg('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email, turnstileToken });
      setSuccessMsg(data.message || 'OTP sent successfully.');
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep(1);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Something went wrong. Please try again.' });
    }
    setIsLoading(false);
  };

  const validateOtp = () => {
    const errs = {};
    if (!otp.trim()) errs.otp = 'OTP is required.';
    else if (!/^\d{6}$/.test(otp)) errs.otp = 'OTP must be a 6-digit code.';
    if (!turnstileToken) errs.turnstile = 'Please complete the security check.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp, turnstileToken });
      setSuccessMsg(data.message || 'OTP verified.');
      setStep(2);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'OTP verification failed. Please try again.' });
    }
    setIsLoading(false);
  };

  const validatePassword = () => {
    const errs = {};
    if (!newPassword) errs.newPassword = 'New password is required.';
    else if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      errs.newPassword = 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
    }
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your new password.';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!turnstileToken) errs.turnstile = 'Please complete the security check.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword, turnstileToken });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Password reset failed. Please try again.' });
    }
    setIsLoading(false);
  };

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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
                <p className="text-slate-400 mt-2 text-sm">We'll send a secure OTP to your email.</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 ${i === step ? 'text-blue-300' : 'text-slate-500'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                        i < step
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : i === step
                            ? 'border-blue-400/60 text-blue-300'
                            : 'border-slate-600 text-slate-500'
                      }`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-600" />}
                  </div>
                ))}
              </div>

              {successMsg && (
                <div className="p-3 bg-blue-500/10 text-blue-300 text-sm rounded-xl border border-blue-500/20 text-center mb-4">
                  {successMsg}
                </div>
              )}

              {devOtp && (
                <div className="p-3 bg-amber-500/10 text-amber-300 text-sm rounded-xl border border-amber-500/20 mb-4">
                  <p className="font-semibold mb-1">Development mode — email sending is not configured.</p>
                  <p>Your OTP is: <span className="font-mono font-bold tracking-widest">{devOtp}</span></p>
                </div>
              )}

              <form onSubmit={step === 0 ? handleRequestOtp : step === 1 ? handleVerifyOtp : handleResetPassword} className="space-y-5">
                {step === 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">Registered Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
                          placeholder="you@example.com"
                          className={`w-full pl-11 pr-4 py-3 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.email ? 'border-red-400/50' : 'border-white/[0.08]'}`}
                        />
                      </div>
                      <AnimatePresence>{errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.email}</motion.p>}</AnimatePresence>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">Enter OTP</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); if (errors.otp) setErrors(prev => ({ ...prev, otp: '' })); }}
                          placeholder="6-digit code"
                          className={`w-full pl-11 pr-4 py-3 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.otp ? 'border-red-400/50' : 'border-white/[0.08]'}`}
                        />
                      </div>
                      <AnimatePresence>{errors.otp && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.otp}</motion.p>}</AnimatePresence>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isLoading}
                      className="text-sm text-blue-400 hover:text-blue-300 transition font-medium"
                    >
                      Resend OTP
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' })); }}
                          placeholder="Min 8 characters, upper + lower + number"
                          className={`w-full pl-11 pr-4 py-3 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.newPassword ? 'border-red-400/50' : 'border-white/[0.08]'}`}
                        />
                      </div>
                      <AnimatePresence>{errors.newPassword && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.newPassword}</motion.p>}</AnimatePresence>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                          placeholder="Re-enter your new password"
                          className={`w-full pl-11 pr-4 py-3 bg-white/[0.07] border rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 ${errors.confirmPassword ? 'border-red-400/50' : 'border-white/[0.08]'}`}
                        />
                      </div>
                      <AnimatePresence>{errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</motion.p>}</AnimatePresence>
                    </div>
                  </>
                )}

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

                <AnimatePresence>{errors.submit && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 text-center">
                    {errors.submit}
                  </motion.div>
                )}</AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white font-semibold text-base shadow-lg shadow-blue-600/25 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</>
                  ) : step === 0 ? (
                    <><span>Send OTP</span> <ArrowRight className="w-5 h-5" /></>
                  ) : step === 1 ? (
                    <><span>Verify OTP</span> <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <><span>Reset Password</span> <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between pt-4">
                <Link to="/login" className="text-sm text-slate-400 hover:text-slate-300 transition flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
