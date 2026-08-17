import React, { useRef, useState, useEffect } from 'react';
import { motion, animate, useInView, useMotionValue, useTransform } from 'framer-motion';
import { API_BASE } from '../../config/api';

// ─── Static SVG Icons (no JS animation loops) ───
const AnimatedGraduationCap = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M12 40 L40 28 L68 40 L40 52 Z" fill="url(#capGrad)" opacity="0.85" />
      <circle cx="40" cy="40" r="3" fill="#c4b5fd" />
      <path d="M40 43 Q46 50 50 48" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.8" strokeLinecap="round" />
      <rect x="28" y="52" width="24" height="5" rx="2.5" fill="url(#capGrad)" opacity="0.5" />
      <circle className="animate-orbit-sm" cx="62" cy="36" r="2" fill="#60a5fa" opacity="0.9" />
      <circle className="animate-orbit-sm-reverse" cx="18" cy="36" r="2" fill="#818cf8" opacity="0.8" />
    </svg>
  </div>
);

// ─── Animated Alumni Profiles ───
const AnimatedProfiles = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full absolute inset-0">
      <defs>
        <linearGradient id="profileGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="profileGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M28 40 Q40 52 52 40"
        stroke="#60a5fa"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      <circle r="2.5" fill="#c4b5fd" opacity="0.7">
        <animateMotion dur="3s" repeatCount="indefinite" path="M28 40 Q40 52 52 40" />
      </circle>
      <circle r="2.5" fill="#c4b5fd" opacity="0.7">
        <animateMotion dur="3s" repeatCount="indefinite" path="M52 40 Q40 52 28 40" />
      </circle>
      <g className="animate-float-gentle">
        <circle cx="24" cy="38" r="12" fill="url(#profileGrad1)" opacity="0.8" />
        <circle cx="24" cy="33" r="5" fill="rgba(255,255,255,0.3)" />
        <path d="M16 44 Q24 48 32 44" fill="rgba(255,255,255,0.15)" />
      </g>
      <g className="animate-float-gentle-delay">
        <circle cx="56" cy="38" r="12" fill="url(#profileGrad2)" opacity="0.8" />
        <circle cx="56" cy="33" r="5" fill="rgba(255,255,255,0.3)" />
        <path d="M48 44 Q56 48 64 44" fill="rgba(255,255,255,0.15)" />
      </g>
    </svg>
  </div>
);

// ─── Animated Handshake ───
const AnimatedHandshake = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="handshakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="rgba(255,255,255,0.05)" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <g className="animate-float-gentle">
        <path
          d="M22 48 Q26 38 32 36 Q36 34 38 38 Q40 42 36 46 Q32 48 30 44 M50 48 Q54 38 48 36 Q44 34 42 38 Q40 42 44 46 Q48 48 50 44"
          stroke="url(#handshakeGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 36 Q36 38 40 36 Q44 38 48 36"
          stroke="url(#handshakeGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  </div>
);

// ─── Animated Trophy ───
const AnimatedTrophy = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <g className="animate-float-gentle">
        <path
          d="M26 18 Q26 14 30 12 L50 12 Q54 14 54 18 L54 26 Q54 36 46 40 L34 40 Q26 36 26 26 Z"
          fill="url(#trophyGrad)"
          opacity="0.85"
        />
        <path d="M54 18 Q60 20 60 26 Q60 32 54 34" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M26 18 Q20 20 20 26 Q20 32 26 34" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" opacity="0.7" />
        <rect x="32" y="40" width="16" height="4" rx="2" fill="url(#trophyGrad)" opacity="0.6" />
        <rect x="28" y="44" width="24" height="6" rx="3" fill="url(#trophyGrad)" opacity="0.5" />
      </g>
    </svg>
  </div>
);

// ─── Counter ───
const Counter = ({ to, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(to === null ? '—' : to);

  useEffect(() => {
    if (to === null) {
      setCount('—');
      return;
    }
    if (typeof to === 'number') {
      if (to === 0) {
        setCount(0);
        return;
      }
      if (inView) {
        const controls = animate(0, to, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate(value) {
            setCount(Math.floor(value));
          }
        });
        return () => controls.stop();
      } else {
        setCount(to);
      }
    } else {
      setCount(to);
    }
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── Icons Map ───
const ICONS = {
  GraduationCap: AnimatedGraduationCap,
  Users: AnimatedProfiles,
  Microscope: AnimatedHandshake,
  BriefcaseBusiness: AnimatedTrophy,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.985 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.3 },
  },
};

// ─── Tilt Card ───
const TiltCard = ({ stat, index }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useTransform(x, [-0.5, 0.5], [8, -8]);
  const mouseYSpring = useTransform(y, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const IconComponent = ICONS[stat.icon];

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: mouseYSpring,
        rotateY: mouseXSpring,
        transformPerspective: 1000,
      }}
      whileHover={{ scale: 1.03, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-[24px] p-8 border border-blue-400/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.12)] transition-shadow duration-300 overflow-hidden will-change-transform"
    >
      {/* Ambient glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(96,165,250,0.5), rgba(139,92,246,0.3), transparent)' }}
      >
        <div className="absolute inset-[1px] rounded-[23px] bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]" />
      </div>

      {/* Glass sheen overlay */}
      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Animated Icon */}
        <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:bg-white/[0.10] group-hover:border-white/[0.15] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(96,165,250,0.12)]">
          <IconComponent />
        </div>

        {/* Counter */}
        <h3 className="text-4xl font-bold text-white tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 transition-colors duration-300">
          <Counter to={stat.value} suffix={stat.suffix} />
        </h3>

        {/* Label */}
        <p className="text-sm font-medium text-blue-200/60 group-hover:text-blue-200/80 transition-colors">
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
};

const TrustedStatistics = () => {
  const [stats, setStats] = useState({
    students: null,
    alumni: null,
    researchOpportunities: null,
    careerOpportunities: null
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPublicStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/stats/public`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStats({
              students: typeof data.students === 'number' ? data.students : '—',
              alumni: typeof data.alumni === 'number' ? data.alumni : '—',
              researchOpportunities: typeof data.researchOpportunities === 'number' ? data.researchOpportunities : '—',
              careerOpportunities: typeof data.careerOpportunities === 'number' ? data.careerOpportunities : '—'
            });
          }
        } else {
          if (isMounted) setStats({ students: '—', alumni: '—', researchOpportunities: '—', careerOpportunities: '—' });
        }
      } catch (err) {
        if (isMounted) setStats({ students: '—', alumni: '—', researchOpportunities: '—', careerOpportunities: '—' });
      }
    };

    fetchPublicStats();
    return () => { isMounted = false; };
  }, []);

  const statsList = [
    { value: stats.students, suffix: '', label: "Registered Students", icon: "GraduationCap" },
    { value: stats.alumni, suffix: '', label: "Verified Alumni", icon: "Users" },
    { value: stats.researchOpportunities, suffix: '', label: "Research Opportunities", icon: "Microscope" },
    { value: stats.careerOpportunities, suffix: '', label: "Career Opportunities", icon: "BriefcaseBusiness" },
  ];

  return (
    <section className="py-32 relative bg-white dark:bg-[#0B1220] overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0 will-change-transform">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[60px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-50/40 rounded-full blur-[60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6"
          >
            Trusted by Our University Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.4, delay: 0.1 }}
            className="text-xl text-gray-500 leading-relaxed"
          >
            Connecting students and alumni through AI-powered mentorship, research, learning, and career opportunities.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsList.map((stat, index) => (
            <TiltCard key={index} stat={stat} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedStatistics;

