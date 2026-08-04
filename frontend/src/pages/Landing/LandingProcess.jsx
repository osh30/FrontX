import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, BrainCircuit, SearchCheck, Users,
  FlaskConical, CalendarClock, Briefcase, Rocket,
} from 'lucide-react';

const JOURNEY_STEPS = [
  { label: 'Create Profile', icon: UserPlus },
  { label: 'AI Analysis', icon: BrainCircuit },
  { label: 'Find Skill Gaps', icon: SearchCheck },
  { label: 'Connect with Alumni', icon: Users },
  { label: 'Join Research', icon: FlaskConical },
  { label: 'Attend Sessions', icon: CalendarClock },
  { label: 'Apply for Jobs', icon: Briefcase },
  { label: 'Career Success', icon: Rocket },
];

// ─── Roadmap arc geometry ───
const ARC_W = 1200;
const ARC_H = 400;
const ARC_BASE_Y = 300;
const ARC_AMP = 190;

const ARC_POINTS = JOURNEY_STEPS.map((_, i) => {
  const t = i / (JOURNEY_STEPS.length - 1);
  return {
    x: Math.round((ARC_W * (i + 0.5)) / JOURNEY_STEPS.length),
    y: Math.round(ARC_BASE_Y - ARC_AMP * Math.sin(Math.PI * t)),
  };
});

function buildSegments(points) {
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    segs.push({
      p1, p2,
      d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`,
    });
  }
  return segs;
}

const SEGMENTS = buildSegments(ARC_POINTS);
const FULL_PATH = SEGMENTS.map(s => s.d).join(' ');

const toPct = (p) => ({
  left: `${(p.x / ARC_W) * 100}%`,
  top: `${(p.y / ARC_H) * 100}%`,
});

const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.985 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18, mass: 0.3 },
  },
};

function HexIcon({ Icon, size = 100, lit = false, dim = false }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0" style={{
        clipPath: HEX,
        background: 'linear-gradient(160deg, rgba(191,219,254,0.95), rgba(224,242,254,0.65))',
        filter: 'drop-shadow(0 10px 24px rgba(30,64,175,0.16))',
        opacity: dim ? 0.55 : 1,
        transition: 'opacity 0.4s ease, filter 0.4s ease',
      }} />
      <div className="absolute inset-0" style={{
        clipPath: HEX,
        transform: 'scale(0.88)',
        background: 'linear-gradient(160deg, #ffffff 0%, #f6f9ff 100%)',
      }} />
      <div className="absolute inset-0" style={{
        clipPath: HEX,
        transform: 'scale(0.88)',
        background: `radial-gradient(60% 60% at 50% 40%, ${lit ? 'rgba(96,165,250,0.28)' : 'rgba(96,165,250,0.10)'}, transparent 70%)`,
        transition: 'background 0.4s ease',
      }} />
      <Icon
        className="relative z-10"
        style={{ width: size * 0.4, height: size * 0.4, color: lit ? '#1D4ED8' : '#2563EB' }}
        strokeWidth={1.5}
      />
    </div>
  );
}

export const HowItWorks = () => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [activeStep, setActiveStep] = useState(-1);
  const cardRefs = useRef([]);

  const setCardRef = useCallback((el, i) => {
    cardRefs.current[i] = el;
  }, []);

  // Active step tracking: each card lights up sequentially as it enters viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.step);
            if (!isNaN(idx)) {
              setActiveStep(prev => Math.max(prev, idx));
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );

    const refs = cardRefs.current;
    refs.forEach((el, i) => {
      if (el) {
        el.dataset.step = String(i);
        obs.observe(el);
      }
    });
    return () => {
      refs.forEach(el => { if (el) obs.unobserve(el); });
    };
  }, []);

  const getPathState = useCallback((idx) => {
    if (hoveredIndex >= 0) {
      if (idx === hoveredIndex || idx === hoveredIndex - 1) return 'hover';
      return 'dim';
    }
    if (activeStep < 0) return 'idle';
    if (idx < activeStep) return 'completed';
    if (idx === activeStep) return 'active';
    return 'inactive';
  }, [hoveredIndex, activeStep]);

  const pathOpacity = (state) => {
    switch (state) {
      case 'completed': return 0.75;
      case 'active': return 0.55;
      case 'hover': return 0.9;
      case 'idle': return 0.4;
      case 'inactive': return 0.08;
      default: return 0.1;
    }
  };

  const glowOpacity = (state) => {
    switch (state) {
      case 'completed': return 0.3;
      case 'active': return 0.22;
      case 'hover': return 0.38;
      case 'idle': return 0.12;
      case 'inactive': return 0.03;
      default: return 0.05;
    }
  };

  const particleOpacity = (state) => {
    switch (state) {
      case 'completed': return 0.9;
      case 'active': return 0.7;
      case 'hover': return 1;
      case 'idle': return 0.5;
      case 'inactive': return 0.05;
      default: return 0.1;
    }
  };

  const isLit = (i) => hoveredIndex >= 0
    ? Math.abs(i - hoveredIndex) <= 1
    : (activeStep < 0 || i <= activeStep);

  return (
    <section id="how-it-works" className="pt-28 md:pt-36 pb-12 md:pb-16 relative bg-white dark:bg-[#0B1220] overflow-hidden scroll-mt-28">
      {/* Very subtle blurred blue glow behind the roadmap */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-5xl h-[70%] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(50% 50% at 50% 45%, rgba(59,130,246,0.12), rgba(147,197,253,0.06) 45%, transparent 72%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight uppercase mb-5"
          >
            How FRONTX Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.4, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-500 leading-relaxed"
          >
            A seamless journey designed to accelerate your career growth.
          </motion.p>
        </div>

        {/* ─── Desktop: single curved arc roadmap ─── */}
        <div className="relative hidden lg:block">
          <svg
            className="w-full h-auto pointer-events-none z-0"
            viewBox={`0 0 ${ARC_W} ${ARC_H}`}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="35%" stopColor="#2563EB" />
                <stop offset="70%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <filter id="roadGlow">
                <feGaussianBlur stdDeviation="3" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="roadGlowStrong">
                <feGaussianBlur stdDeviation="6" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="roadGlowSoft">
                <feGaussianBlur stdDeviation="1.5" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Continuous base line */}
            <path d={FULL_PATH} fill="none" stroke="url(#roadGrad)" strokeWidth="6" opacity="0.08" strokeLinecap="round" filter="url(#roadGlowStrong)" />
            <path d={FULL_PATH} fill="none" stroke="url(#roadGrad)" strokeWidth="2" opacity="0.18" strokeLinecap="round" />

            {SEGMENTS.map((seg, idx) => {
              const state = getPathState(idx);
              const op = pathOpacity(state);
              const glowOp = glowOpacity(state);
              const ptOp = particleOpacity(state);
              return (
                <g key={idx} style={{ transition: 'opacity 0.7s ease' }}>
                  <path d={seg.d} fill="none" stroke="url(#roadGrad)" strokeWidth="9" opacity={glowOp} filter="url(#roadGlowStrong)" strokeLinecap="round" style={{ transition: 'opacity 0.7s ease' }} />
                  <path d={seg.d} fill="none" stroke="url(#roadGrad)" strokeWidth="4" opacity={glowOp * 0.55} filter="url(#roadGlow)" strokeLinecap="round" style={{ transition: 'opacity 0.7s ease' }} />
                  <path d={seg.d} fill="none" stroke="url(#roadGrad)" strokeWidth="3" opacity={op} strokeLinecap="round" strokeDasharray="12 9" style={{ transition: 'opacity 0.7s ease' }}>
                    <animate attributeName="strokeDashoffset" values="0;-42" dur="1.8s" repeatCount="indefinite" />
                  </path>
                  <path d={seg.d} fill="none" stroke="url(#roadGrad)" strokeWidth="1.5" opacity={op * 0.5} strokeLinecap="round" strokeDasharray="5 15" style={{ transition: 'opacity 0.7s ease' }}>
                    <animate attributeName="strokeDashoffset" values="0;-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="3" fill="#60A5FA" filter="url(#roadGlowSoft)" opacity={ptOp} style={{ transition: 'opacity 0.7s ease' }}>
                    <animateMotion dur={`${3 + idx * 0.2}s`} repeatCount="indefinite" path={seg.d} rotate="auto" />
                  </circle>
                  <circle r="2" fill="#A855F7" opacity={ptOp * 0.85} style={{ transition: 'opacity 0.7s ease' }}>
                    <animateMotion dur={`${4 + idx * 0.2}s`} repeatCount="indefinite" path={seg.d} rotate="auto" begin="1.5s" />
                  </circle>
                  <circle r="1.8" fill="#38BDF8" opacity={ptOp * 0.7} style={{ transition: 'opacity 0.7s ease' }}>
                    <animateMotion dur={`${5 + idx * 0.2}s`} repeatCount="indefinite" path={seg.d} rotate="auto" begin="3s" />
                  </circle>
                </g>
              );
            })}

            {/* Diamond checkpoints at card centers */}
            {ARC_POINTS.map((pos, i) => {
              const lit = isLit(i);
              const sz = lit ? 6 : 4;
              const dOp = lit ? 0.95 : 0.15;
              return (
                <g key={`diamond-${i}`} style={{ transition: 'opacity 0.6s ease' }}>
                  <polygon
                    points={`${pos.x},${pos.y - sz} ${pos.x + sz},${pos.y} ${pos.x},${pos.y + sz} ${pos.x - sz},${pos.y}`}
                    fill="url(#roadGrad)"
                    filter="url(#roadGlowSoft)"
                    opacity={dOp}
                    style={{ transition: 'opacity 0.6s ease' }}
                  />
                  <circle cx={pos.x} cy={pos.y} r="2" fill="white" opacity={dOp} filter="url(#roadGlowSoft)" style={{ transition: 'opacity 0.6s ease' }} />
                </g>
              );
            })}

            {/* Energy pulse rings */}
            {ARC_POINTS.map((pos, i) => (
              <circle
                key={`pulse-${i}`}
                cx={pos.x}
                cy={pos.y}
                r="3"
                fill="none"
                stroke="url(#roadGrad)"
                strokeWidth="1"
                opacity={isLit(i) ? 0.35 : 0.04}
                style={{ transition: 'opacity 0.6s ease' }}
              >
                <animate attributeName="r" values="3;16;3" dur={`${3 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} />
                <animate attributeName="opacity" values="0.35;0;0.35" dur={`${3 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} />
              </circle>
            ))}
          </svg>

          {/* Cards sitting on the curve */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="absolute inset-0 z-10"
          >
            {JOURNEY_STEPS.map((step, index) => {
              const Icon = step.icon;
              const lit = isLit(index);
              const dim = hoveredIndex >= 0 && Math.abs(index - hoveredIndex) > 1;
              return (
                <div
                  key={index}
                  ref={el => setCardRef(el, index)}
                  data-step={index}
                  className="absolute flex flex-col items-center will-change-transform"
                  style={{ ...toPct(ARC_POINTS[index]), transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    variants={cardVariants}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    whileHover={{ y: -8, scale: 1.06 }}
                    className="flex flex-col items-center cursor-default"
                  >
                    <HexIcon Icon={Icon} size={104} lit={lit} dim={dim} />
                    <h4 className={`mt-5 text-sm font-bold text-center tracking-wide transition-colors duration-300 ${lit ? 'text-gray-900' : 'text-gray-700'}`}>
                      {step.label}
                    </h4>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ─── Mobile & Tablet: vertical roadmap timeline ─── */}
        <div className="lg:hidden relative">
          <svg className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-[22px] h-auto pointer-events-none z-0"
            width="22" viewBox="0 0 22 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="vRoadGrad" x1="0" y1="0" x2="0" y2="100">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="35%" stopColor="#2563EB" />
                <stop offset="70%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <line x1="11" y1="0" x2="11" y2="100" stroke="url(#vRoadGrad)" strokeWidth="2" strokeDasharray="6 9" opacity="0.35">
              <animate attributeName="stroke-dashoffset" from="0" to="-30" dur="2s" repeatCount="indefinite" />
            </line>
          </svg>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="relative z-10"
          >
            {JOURNEY_STEPS.map((step, index) => {
              const Icon = step.icon;
              const lit = isLit(index);
              return (
                <div
                  key={index}
                  ref={el => setCardRef(el, index)}
                  data-step={index}
                  className="flex flex-col items-center mb-12 last:mb-0"
                >
                  <motion.div
                    variants={cardVariants}
                    className="flex flex-col items-center"
                  >
                    <HexIcon Icon={Icon} size={92} lit={lit} />
                    <h4 className="mt-4 text-base font-bold text-center tracking-wide text-gray-900">
                      {step.label}
                    </h4>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
