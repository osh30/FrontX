import { motion } from 'framer-motion';
import { Settings, Lock } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const AdminSettings = () => (
  <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="flex-1 overflow-y-auto">
    <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-10">
      <motion.div variants={fadeUp}>
        <h1 className="text-[30px] font-[800] tracking-[-0.025em] leading-tight" style={{ color: '#1E293B' }}>Settings</h1>
        <p className="text-[16px] font-normal mt-2 leading-[1.6]" style={{ color: '#475569' }}>Platform configuration and system settings.</p>
      </motion.div>
      <motion.div variants={fadeUp} custom={1} className="relative overflow-hidden rounded-2xl p-[1px]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07]" />
        <div className="relative rounded-[calc(1rem-1px)] p-16 text-center" style={{
          background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
        }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
                backgroundSize: '250% 100%',
                animation: 'shimmerSweep 8s ease-in-out infinite',
              }} />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/15 flex items-center justify-center mx-auto mb-5 relative">
              <Settings className="w-8 h-8 text-slate-400 relative z-10" />
              <div className="absolute inset-0 rounded-2xl bg-slate-500/10 blur-xl" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">Platform settings, email templates, notification rules, and system configuration will be manageable here.</p>
            <div className="flex items-center gap-2 justify-center mt-5 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              Under development
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    <style>{`@keyframes shimmerSweep { 0%, 100% { background-position: -250% 0; } 50% { background-position: 250% 0; } }`}</style>
  </motion.div>
);

export default AdminSettings;
