import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimatedIcon = ({ children, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-400/15 flex items-center justify-center shrink-0"
  >
    {children}
  </motion.div>
);

const FEATURES = [
  {
    icon: <GraduationCap className="w-6 h-6 text-blue-300/90" strokeWidth={1.5} />,
    title: 'Student Development',
    desc: 'Fund scholarships, workshops, and skill-building programs.',
  },
  {
    icon: <Heart className="w-6 h-6 text-purple-300/90" strokeWidth={1.5} />,
    title: 'Alumni Impact',
    desc: 'Empower alumni to mentor and guide the next generation.',
  },
  {
    icon: <Rocket className="w-6 h-6 text-cyan-300/90" strokeWidth={1.5} />,
    title: 'Career Growth',
    desc: 'Expand career opportunities and industry connections.',
  },
];

const AMOUNTS = [500, 1000, 2000, 5000];

const DonationSection = () => {
  const [selected, setSelected] = useState(1000);
  const [customOpen, setCustomOpen] = useState(false);
  const [customVal, setCustomVal] = useState('');

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Dark navy background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060E1F] via-[#0A1628] to-[#0D1B36]" />

      {/* Ambient glow orbs */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] bg-blue-300/20 rounded-full pointer-events-none"
          style={{ left: `${8 + i * 12}%`, top: `${15 + (i * 11) % 70}%` }}
          animate={{ y: [-6, 6, -6], opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(96,165,250,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
        {/* ─── Main Content ─── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                Support the Next Generation{' '}
                <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  of Talent
                </span>
              </h2>
            </div>

            <p className="text-lg text-blue-100/50 leading-relaxed max-w-lg">
              Your contribution helps students access mentorship, learning resources, research opportunities, career guidance, and a stronger university ecosystem.
            </p>

            {/* Feature points */}
            <div className="space-y-5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 100, damping: 18 }}
                  className="flex items-start gap-4 group"
                >
                  <AnimatedIcon delay={i * 0.6}>
                    {f.icon}
                  </AnimatedIcon>
                  <div className="pt-1">
                    <h4 className="text-white font-semibold text-[15px] mb-1">{f.title}</h4>
                    <p className="text-blue-200/40 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column — Donation Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="relative"
          >
            {/* Light beam behind card */}
            <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-[48px] blur-[40px] pointer-events-none" />

            <div className="relative bg-gradient-to-br from-[#0C1A33] via-[#0F1F3D] to-[#0A1530] rounded-[28px] border border-blue-400/10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-[28px]" />

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 60px rgba(59,130,246,0.03)' }} />

              <div className="relative z-10 p-8 md:p-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/15 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-300/80" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Make a Contribution</h3>
                </div>

                {/* Amount buttons */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {AMOUNTS.map((amt) => (
                    <motion.button
                      key={amt}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelected(amt); setCustomOpen(false); }}
                      className={`relative py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer border ${
                        selected === amt && !customOpen
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/50 shadow-[0_0_24px_rgba(59,130,246,0.25)]'
                          : 'bg-white/[0.04] text-blue-200/60 border-white/[0.06] hover:bg-white/[0.08] hover:border-blue-400/20 hover:text-blue-200/90'
                      }`}
                    >
                      {selected === amt && !customOpen && (
                        <motion.div layoutId="amtHighlight" className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500/50 shadow-[0_0_24px_rgba(59,130,246,0.25)]" transition={{ type: 'spring', stiffness: 200, damping: 22 }} />
                      )}
                      <span className="relative z-10">৳{amt.toLocaleString()}</span>
                    </motion.button>
                  ))}

                  {/* Custom */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCustomOpen(!customOpen)}
                    className={`relative py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer border ${
                      customOpen
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/50 shadow-[0_0_24px_rgba(59,130,246,0.25)]'
                        : 'bg-white/[0.04] text-blue-200/60 border-white/[0.06] hover:bg-white/[0.08] hover:border-blue-400/20 hover:text-blue-200/90'
                    }`}
                  >
                    <span className="relative z-10">Custom</span>
                  </motion.button>
                </div>

                {/* Custom input */}
                <motion.div
                  initial={false}
                  animate={{ height: customOpen ? 'auto' : 0, opacity: customOpen ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 text-sm font-semibold">৳</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customVal}
                      onChange={(e) => setCustomVal(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-blue-200/30 focus:outline-none focus:border-blue-400/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300"
                    />
                  </div>
                </motion.div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Link to="/donate" className="flex-1 block">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-[0_4px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.4)] transition-shadow duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Donate Now
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </div>

                {/* Subtle note */}
                <p className="text-center text-[11px] text-blue-200/25 mt-5">
                  Secure payment · Tax-deductible · Instant receipt
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
