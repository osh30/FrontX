import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronLeft, ChevronRight, User, BrainCircuit, Users, BriefcaseBusiness, CalendarCheck, Compass, FileText, FlaskConical, BookOpen, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityDashboard = () => {
  const [hoveredPost, setHoveredPost] = useState(null);
  const posts = [
    {
      emoji: '🟣', author: 'Anonymous', tag: 'Student',
      text: "I'm confused whether I should learn React or Flutter first. Any alumni suggestions?",
      badge: { text: 'Anonymous', cls: 'bg-purple-500/15 text-purple-300' },
      interactions: { replies: 18, helpful: 42 },
    },
    {
      emoji: '👩‍💻', author: 'Shanta', tag: 'Alumni',
      text: "I've uploaded my Software Engineering interview roadmap and resume template.",
      badge: { text: '✔ Verified Alumni', cls: 'bg-blue-500/15 text-blue-300' },
      interactions: { resource: 'Resource Shared', saved: 34 },
    },
    {
      emoji: '👨‍🎓', author: 'Sabbir', tag: 'Alumni',
      text: 'Looking for teammates for our AI Healthcare research project.',
      badge: { text: 'Join Research', cls: 'bg-emerald-500/15 text-emerald-300' },
      interactions: { interested: 12 },
    },
    {
      emoji: '👩', author: 'Nure', tag: 'Student',
      text: 'Finally received my internship at Brain Station 23! Thank you FRONTX mentors ❤️',
      badge: { text: '🎉 Celebration', cls: 'bg-amber-500/15 text-amber-300' },
      interactions: { reactions: ['🎉', '❤️', '👏'] },
    },
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#081A3A] to-[#0B1635] rounded-[28px] border border-blue-400/15 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
      style={{ aspectRatio: '4/3', willChange: 'transform' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[15%] w-[55%] h-[55%] bg-gradient-to-br from-blue-500/10 via-purple-500/6 to-transparent rounded-full blur-[60px] will-change-transform"
        />
      </div>

      {/* Particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-[2px] h-[2px] bg-blue-300/25 rounded-full pointer-events-none"
          style={{ left: `${12 + i * 25}%`, top: `${15 + (i * 10) % 70}%` }}
          animate={{ y: [-4, 4, -4], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4 + (i % 3) * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      {/* Post feed */}
      <div className="absolute inset-0 z-[5] flex flex-col justify-center py-6">
        <div className="w-full space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              onHoverStart={() => setHoveredPost(i)}
              onHoverEnd={() => setHoveredPost(null)}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 100, damping: 18 }}
              whileHover={{ y: -4 }}
              className={`relative p-4 rounded-[18px] border cursor-pointer transition-all duration-300 ease-out ${
                hoveredPost === i
                  ? 'bg-white/[0.09] border-blue-400/25 shadow-[0_8px_30px_rgba(59,130,246,0.15)]'
                  : 'bg-white/[0.06] border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:bg-white/[0.08] hover:border-blue-400/15 hover:shadow-[0_8px_30px_rgba(59,130,246,0.10)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20 flex items-center justify-center shrink-0 text-[15px]">
                  {post.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-white/90 text-sm font-semibold whitespace-nowrap">{post.author}</span>
                    {post.tag && (
                      <span className="text-[11px] text-blue-300/60 font-medium bg-blue-400/10 px-1.5 py-0.5 rounded">{post.tag}</span>
                    )}
                    {post.badge && (
                      <span className={`text-[11px] font-medium ${post.badge.cls} px-1.5 py-0.5 rounded ml-auto`}>{post.badge.text}</span>
                    )}
                  </div>
                  <p className="text-white/60 text-xs md:text-[13px] leading-relaxed">{post.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {post.interactions.replies && (
                      <span className="text-[11px] text-blue-300/50 font-medium flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {post.interactions.replies} Replies
                      </span>
                    )}
                    {post.interactions.helpful && (
                      <span className="text-[11px] text-blue-300/50 font-medium flex items-center gap-1">❤️ {post.interactions.helpful} Helpful</span>
                    )}
                    {post.interactions.resource && (
                      <span className="text-[11px] text-blue-300/50 font-medium flex items-center gap-1">📄 {post.interactions.resource}</span>
                    )}
                    {post.interactions.saved && (
                      <span className="text-[11px] text-blue-300/50 font-medium flex items-center gap-1">💾 {post.interactions.saved} Saved</span>
                    )}
                    {post.interactions.interested && (
                      <span className="text-[11px] text-blue-300/50 font-medium flex items-center gap-1">👥 {post.interactions.interested} Interested</span>
                    )}
                    {post.interactions.reactions && (
                      <span className="text-xs">{post.interactions.reactions.join(' ')}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LiveCommunity = () => {
  return (
    <section id="community" className="py-24 bg-white dark:bg-[#0B1220] relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-transparent rounded-full blur-[60px] pointer-events-none will-change-transform" />

      <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex-1 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Join the Conversation
            </h2>
            <p className="text-xl text-gray-700 font-semibold leading-relaxed">
              A place to think out loud.
            </p>
            <div className="space-y-5 text-gray-600 leading-relaxed text-[17px] max-w-xl">
              <p>
                Ask a question you'd never ask in a lecture hall. Share a win. Get feedback from people a few years further down the same road.
              </p>
              <p>
                Students can post under their name or anonymously. Alumni always post under their real identity — so advice comes with accountability, not guesswork.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 18 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-950 font-semibold rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
              >
                Explore Community <MessageSquare className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Community Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="flex-1 w-full max-w-xl"
          >
            <CommunityDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
};


export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const testimonials = [
    {
      name: 'Nure', role: 'Student', org: 'University of Frontier Technology Bangladesh', type: 'student',
      quote: "I was always confused about what to learn next. FRONTX AI Skill Analysis built a personalized roadmap, and alumni guidance helped me focus on the right skills.",
      badges: [
        { icon: BrainCircuit, title: 'AI Skill Analysis', desc: 'Used' },
        { icon: CalendarCheck, title: 'Completed', desc: '5 Mentorship Sessions' },
        { icon: Compass, title: 'Personalized', desc: 'Learning Roadmap' },
      ],
    },
    {
      name: 'Sabbir', role: 'Alumni', org: 'Software Engineer at Brain Station 23', type: 'alumni',
      quote: "Mentoring students through FRONTX has been incredibly rewarding. Reviewing resumes, sharing interview experience, and guiding aspiring engineers has become effortless.",
      badges: [
        { icon: Users, title: 'Mentored', desc: '12 Students' },
        { icon: FileText, title: 'Resume Reviews', desc: 'Completed' },
        { icon: BriefcaseBusiness, title: 'Software Engineer', desc: 'Brain Station 23' },
      ],
    },
    {
      name: 'Pritha', role: 'Student', org: 'University of Frontier Technology Bangladesh', type: 'student',
      quote: "The research collaboration feature helped me build a meaningful project, while the learning resources saved countless hours during interview preparation.",
      badges: [
        { icon: FlaskConical, title: 'Research', desc: 'Contributor' },
        { icon: BookOpen, title: 'Resource Hub', desc: 'Active' },
        { icon: Rocket, title: 'Career', desc: 'Ready' },
      ],
    },
  ];

  const goToPrev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const goToNext = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);

  return (
    <section id="testimonials" className="py-28 bg-white dark:bg-[#0B1220] relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Blurred gradient orbs */}
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[60px] pointer-events-none will-change-transform" />
      <div className="absolute bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-purple-300/15 rounded-full blur-[60px] pointer-events-none will-change-transform" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-cyan-300/10 rounded-full blur-[60px] pointer-events-none will-change-transform" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-[3px] h-[3px] bg-blue-400/20 rounded-full pointer-events-none"
          style={{ left: `${15 + i * 14}%`, top: `${25 + (i * 9) % 50}%` }}
          animate={{ y: [-8, 8, -8], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}

      <div className="max-w-6xl mx-auto px-6 xl:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900"
          >
            Loved by Students & Alumni
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
            className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Real stories from students and alumni who accelerated their academic and career journey through FRONTX.
          </motion.p>
        </div>

        {/* Cards */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative"
        >
          {/* Navigation */}
          <motion.button
            onClick={goToPrev}
            whileHover={{ scale: 1.08, borderColor: 'rgba(96,165,250,0.3)', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -left-5 md:-left-7 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-[#0B1736] border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-blue-200/70" />
          </motion.button>

          <motion.button
            onClick={goToNext}
            whileHover={{ scale: 1.08, borderColor: 'rgba(96,165,250,0.3)', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -right-5 md:-right-7 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-[#0B1736] border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-blue-200/70" />
          </motion.button>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-center">
            {testimonials.map((card, i) => {
              const showMd = activeIndex === 2 ? i >= 1 : (i === activeIndex || i === activeIndex + 1);
              const isFeatured = i === 1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, delay: i * 0.1 }}
                  className={`${i === activeIndex ? '' : 'hidden'} md:${showMd ? '' : 'hidden'} lg:block ${isFeatured ? 'lg:-mt-4 lg:z-10' : ''}`}
                >
                  <motion.div
                    animate={{ y: [0, -(1.5 + (i % 2) * 1), 0] }}
                    transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  >
                    <div className={`relative bg-gradient-to-br from-[#08162F] to-[#0E2145] rounded-[22px] border p-8 overflow-hidden group cursor-pointer transition-all duration-[350ms] ease-out hover:-translate-y-2.5 hover:scale-[1.02] hover:shadow-[0_30px_80px_rgba(59,130,246,0.15)] hover:border-blue-400/25 ${isFeatured ? 'lg:shadow-[0_20px_60px_rgba(59,130,246,0.12)] lg:border-blue-400/20' : 'shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-white/[0.08]'}`}>
                      {/* Glass overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-[22px]" />

                      {/* Lighting */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/8 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-[350ms]" />
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/8 rounded-full blur-[60px] pointer-events-none group-hover:bg-purple-500/12 transition-all duration-[350ms]" />

                      {/* Inner glow */}
                      <div className="absolute inset-0 rounded-[22px] pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(59,130,246,0.03)' }} />

                      {/* Top-left quotation */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
                        className="absolute top-6 left-6 z-10"
                      >
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" className="opacity-15 group-hover:opacity-25 transition-opacity duration-300">
                          <path d="M14 28C11.2 28 9 25.8 9 23V20C9 17.2 11.2 15 14 15H16C17.1 15 18 15.9 18 17V19C18 20.1 17.1 21 16 21H14C14 22 14.5 23 15.5 24C16.5 25 18 26 18 27V28C18 29.1 17.1 30 16 30H14C14 29.5 14 28.8 14 28ZM30 28C27.2 28 25 25.8 25 23V20C25 17.2 27.2 15 30 15H32C33.1 15 34 15.9 34 17V19C34 20.1 33.1 21 32 21H30C30 22 30.5 23 31.5 24C32.5 25 34 26 34 27V28C34 29.1 33.1 30 32 30H30C30 29.5 30 28.8 30 28Z" fill="white" />
                        </svg>
                      </motion.div>

                      {/* Top-right verification badge */}
                      {card.type === 'alumni' && (
                        <motion.div
                          initial={{ opacity: 0, x: 8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.15 }}
                          className="absolute top-6 right-6 z-10"
                        >
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 rounded-full border border-blue-400/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
                            <span className="text-[11px] text-blue-300 font-semibold">Verified Alumni</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center text-center pt-8">
                        {/* Avatar */}
                        <motion.div
                          animate={{ boxShadow: ['0 0 0px rgba(59,130,246,0.2)', '0 0 20px rgba(59,130,246,0.35)', '0 0 0px rgba(59,130,246,0.2)'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-2 border-white/10 mb-5"
                        >
                          <User className="w-7 h-7 text-white/90" />
                        </motion.div>

                        {/* Name */}
                        <h4 className="text-white text-[28px] font-bold leading-tight">{card.name}</h4>

                        {/* Role - gradient cyan */}
                        <p className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent text-sm font-semibold mt-1.5">{card.role}</p>

                        {/* Org */}
                        <p className="text-gray-400 text-sm mt-0.5">{card.org}</p>

                        {/* Quote */}
                        <p className="text-blue-100/70 text-sm md:text-[15px] leading-relaxed mt-6 max-w-md">
                          &ldquo;{card.quote}&rdquo;
                        </p>

                        {/* Badges */}
                        <div className="w-full mt-8 space-y-3">
                          {card.badges.map((badge, j) => (
                            <motion.div
                              key={badge.title}
                              initial={{ opacity: 0, x: -12 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.3 + j * 0.08 }}
                            >
                              <motion.div
                                animate={{ y: [0, -1, 0] }}
                                transition={{ duration: 4 + j * 0.3, repeat: Infinity, ease: 'easeInOut', delay: j * 0.5 }}
                                whileHover={{ y: -3 }}
                              >
                                <div className="flex items-center gap-3 p-3.5 bg-[#0B1B38] rounded-xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden cursor-default transition-all duration-300 hover:bg-[#0D1F42] hover:border-blue-400/20">
                                  {/* Glass reflection */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <badge.icon className="w-[18px] h-[18px] text-blue-300/80" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-blue-200/90 text-sm font-semibold">{badge.title}</p>
                                    <p className="text-blue-200/50 text-xs mt-0.5">{badge.desc}</p>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {testimonials.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveIndex(i)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`h-2.5 rounded-full cursor-pointer transition-all duration-500 ease-out ${
                  activeIndex === i
                    ? 'bg-blue-600 w-8 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-gray-300 dark:bg-gray-600 w-2.5 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const FinalCTA = () => {
  return (
    <section className="py-24 px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden border border-gray-800 shadow-2xl"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/30 to-purple-600/0 rounded-full blur-[60px] pointer-events-none will-change-transform"></div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 relative z-10 tracking-tight">
            Ready to build your future?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 relative z-10">
            Join thousands of students and alumni already connected on FRONX. It takes less than 2 minutes to set up your profile.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
            >
              Join as Student
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-4 bg-gray-800 dark:bg-white/10 text-white font-bold rounded-2xl border border-gray-700 dark:border-white/15 hover:bg-gray-700 dark:hover:bg-white/15 hover:border-gray-600 transition-all duration-300"
            >
              Join as Alumni
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
