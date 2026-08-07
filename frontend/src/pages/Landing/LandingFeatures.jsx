import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// ─── Static SVG Icons (no JS animation loops) ───

const AnimatedBrain = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M32 22 Q24 22 22 30 Q20 38 26 42 Q24 46 28 50 Q30 54 36 52 L40 56 L44 52 Q50 54 52 50 Q56 46 54 42 Q60 38 58 30 Q56 22 48 22 Q44 18 40 18 Q36 18 32 22 Z" fill="url(#brainGrad)" opacity="0.85" />
      <path d="M34 30 Q36 34 38 36" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M46 30 Q44 34 42 36" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M36 42 Q40 44 44 42" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle className="animate-orbit-sm" cx="60" cy="40" r="2.5" fill="#60a5fa" opacity="0.9" />
      <circle className="animate-orbit-sm-reverse" cx="20" cy="40" r="2" fill="#818cf8" opacity="0.8" />
    </svg>
  </div>
);

const AnimatedMentorship = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="mentorGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="mentorGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M22 46 Q22 32 30 28 Q34 26 36 28 Q32 34 34 40 Q36 44 32 46" fill="url(#mentorGrad1)" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,1.5;0,0" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M58 46 Q58 32 50 28 Q46 26 44 28 Q48 34 46 40 Q44 44 48 46" fill="url(#mentorGrad2)" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,1.5;0,0" dur="4s" repeatCount="indefinite" begin="1.5s" />
      </path>
      <path d="M30 34 Q40 44 50 34" stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite" />
      </path>
      <circle cx="40" cy="36" r="2" fill="#c4b5fd" opacity="0.7">
        <animate attributeName="cx" values="30;50;30" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

const AnimatedAtom = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="atomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="40" rx="20" ry="8" fill="none" stroke="url(#atomGrad)" strokeWidth="0.8" opacity="0.4" transform="rotate(0 40 40)" />
      <ellipse cx="40" cy="40" rx="20" ry="8" fill="none" stroke="url(#atomGrad)" strokeWidth="0.8" opacity="0.4" transform="rotate(60 40 40)" />
      <ellipse cx="40" cy="40" rx="20" ry="8" fill="none" stroke="url(#atomGrad)" strokeWidth="0.8" opacity="0.4" transform="rotate(120 40 40)" />
      <circle cx="40" cy="40" r="6" fill="url(#atomGrad)" opacity="0.9" />
      <circle className="animate-electron-1" r="2.5" fill="#a855f7" opacity="0.9" />
      <circle className="animate-electron-2" r="2.5" fill="#a855f7" opacity="0.9" />
      <circle className="animate-electron-3" r="2.5" fill="#a855f7" opacity="0.9" />
    </svg>
  </div>
);

const AnimatedBriefcase = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="briefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <g className="animate-float-gentle">
        <rect x="22" y="30" width="36" height="30" rx="5" fill="url(#briefGrad)" opacity="0.85" />
        <path d="M30 30 L30 26 Q30 22 34 22 L46 22 Q50 22 50 26 L50 30" stroke="url(#briefGrad)" strokeWidth="2.5" fill="none" opacity="0.7" />
        <rect x="37" y="38" width="6" height="8" rx="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="40" cy="42" r="2" fill="rgba(255,255,255,0.3)" />
      </g>
    </svg>
  </div>
);

const AnimatedChat = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <g className="animate-float-gentle">
        <path d="M18 32 Q18 22 28 22 L52 22 Q62 22 62 32 L62 44 Q62 54 52 54 L48 54 L40 62 L40 54 L28 54 Q18 54 18 44 Z" fill="url(#chatGrad)" opacity="0.8" />
        <circle cx="32" cy="36" r="3" fill="rgba(255,255,255,0.3)">
          <animate attributeName="r" values="3;4;3" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="36" r="3" fill="rgba(255,255,255,0.25)">
          <animate attributeName="r" values="3;4;3" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
        </circle>
        <circle cx="48" cy="36" r="3" fill="rgba(255,255,255,0.2)">
          <animate attributeName="r" values="3;4;3" dur="2.5s" repeatCount="indefinite" begin="1.6s" />
        </circle>
      </g>
    </svg>
  </div>
);

const AnimatedBook = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <g className="animate-float-gentle">
        <path d="M20 28 Q20 22 28 22 L40 22 L40 58 L28 58 Q20 58 20 50 Z" fill="url(#bookGrad)" opacity="0.8" />
        <path d="M60 28 Q60 22 52 22 L40 22 L40 58 L52 58 Q60 58 60 50 Z" fill="url(#bookGrad)" opacity="0.6" />
        <line x1="40" y1="22" x2="40" y2="58" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="26" y1="30" x2="36" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
        <line x1="26" y1="36" x2="34" y2="36" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="26" y1="42" x2="32" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="30" x2="54" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="36" x2="52" y2="36" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="42" x2="50" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

const ICONS = {
  Lightbulb: AnimatedBrain,
  Users: AnimatedMentorship,
  BookOpen: AnimatedAtom,
  Briefcase: AnimatedBriefcase,
  MessagesSquare: AnimatedChat,
  Sparkles: AnimatedBook,
};

const FEATURES = [
  { icon: "Lightbulb", title: "AI Skill Analysis", description: "Upload your CV and get instant AI feedback on skill gaps, personalized roadmaps, and certification suggestions." },
  { icon: "Users", title: "Mentorship", description: "Connect with verified university alumni for 1-on-1 guidance, mock interviews, and career advice." },
  { icon: "BookOpen", title: "Research Collaboration", description: "Join active research projects led by alumni or professors. Build your academic portfolio." },
  { icon: "Briefcase", title: "Career Opportunities", description: "Access exclusive job and internship postings directly referred by your university alumni network." },
  { icon: "MessagesSquare", title: "Community Feed", description: "Engage in meaningful discussions, ask questions anonymously, and share your experiences." },
  { icon: "Sparkles", title: "Learning Resources", description: "Access a curated library of notes, roadmaps, and course materials shared by top students and alumni." },
];

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

const TiltCard = ({ feature, index }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useTransform(x, [-0.5, 0.5], [8, -8]);
  const mouseYSpring = useTransform(y, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const IconComponent = ICONS[feature.icon];

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: mouseYSpring, rotateY: mouseXSpring, transformPerspective: 1000 }}
      whileHover={{ scale: 1.03, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-[24px] p-8 border border-blue-400/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.12)] transition-shadow duration-300 overflow-hidden will-change-transform"
    >
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(96,165,250,0.5), rgba(139,92,246,0.3), transparent)' }}>
        <div className="absolute inset-[1px] rounded-[23px] bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]" />
      </div>

      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:bg-white/[0.10] group-hover:border-white/[0.15] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(96,165,250,0.12)]">
          <IconComponent />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-blue-200/60 leading-relaxed group-hover:text-blue-200/80 transition-colors">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export const PlatformOverview = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-[#0B1220] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 will-change-transform">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[60px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-50/40 rounded-full blur-[60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Everything you need for <br />
            <span className="text-[#111111] dark:text-white">career success</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.4, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            FrontX combines AI intelligence with human experience to accelerate your transition from student to professional.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature, index) => (
            <TiltCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
