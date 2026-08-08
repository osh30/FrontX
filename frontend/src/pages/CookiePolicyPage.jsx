import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Cookie, Settings, Layers, User, SlidersHorizontal, Link2,
  Shield, RefreshCw, Mail, HelpCircle, Phone, ArrowRight,
  ChevronDown, CheckCircle2, Star, Zap, BarChart3
} from 'lucide-react';
import LandingNavbar from './Landing/LandingNavbar';
import LandingFooter from './Landing/LandingFooter';

const SECTIONS = [
  { id: 'what-are-cookies', num: null, title: 'What Are Cookies?', icon: Cookie, color: '#3b82f6' },
  { id: 'why-cookies', num: 1, title: 'Why Frontx Uses Cookies', icon: Settings, color: '#a78bfa' },
  { id: 'types-of-cookies', num: 2, title: 'Types of Cookies We Use', icon: Layers, color: '#f59e0b' },
  { id: 'improve-experience', num: 3, title: 'How Cookies Improve Your Experience', icon: User, color: '#34d399' },
  { id: 'managing-cookies', num: 4, title: 'Managing Cookies', icon: SlidersHorizontal, color: '#fb923c' },
  { id: 'third-party', num: 5, title: 'Third-Party Services', icon: Link2, color: '#22d3ee' },
  { id: 'security', num: 6, title: 'Security & Privacy', icon: Shield, color: '#3b82f6' },
  { id: 'updates', num: 7, title: 'Updates to This Policy', icon: RefreshCw, color: '#c084fc' },
  { id: 'contact', num: 8, title: 'Contact Us', icon: Mail, color: '#3b82f6' },
];

const COOKIE_TYPES = [
  { icon: Star, color: '#f59e0b', title: 'Essential Cookies', desc: 'Used for login, security, and core platform functionality.' },
  { icon: Zap, color: '#8b5cf6', title: 'Performance Cookies', desc: 'Used to improve speed, load times, and overall performance.' },
  { icon: SlidersHorizontal, color: '#3b82f6', title: 'Functional Cookies', desc: 'Remember your preferences, settings, and display options.' },
  { icon: BarChart3, color: '#10b981', title: 'Analytics Cookies', desc: 'Help us understand how you use the platform to improve it.' },
];

const EXPERIENCE_STEPS = [
  { label: 'Cookies', icon: Cookie, color: '#3b82f6' },
  { label: 'Remember Preferences', icon: Settings, color: '#a78bfa' },
  { label: 'Improve Experience', icon: User, color: '#34d399' },
  { label: 'Better Learning Journey', icon: Star, color: '#fbbf24' },
];

const CookiePolicyPage = () => {
  const [activeSection, setActiveSection] = useState('what-are-cookies');
  const [expandedSections, setExpandedSections] = useState(new Set(['what-are-cookies']));
  const mainRef = useRef(null);

  const toggleSection = useCallback((id) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveSection(top.target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <LandingNavbar />

      {/* Header Banner */}
      <section className="pt-[120px] sm:pt-[136px] pb-14 sm:pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 xl:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Cookie className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-slate-400">Last updated: July 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Cookie Policy
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              Learn how Frontx uses cookies and similar technologies to improve your experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main ref={mainRef} className="max-w-6xl mx-auto px-6 xl:px-8 py-12 sm:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">

          {/* Sidebar TOC */}
          <aside className="hidden lg:block sticky top-[140px] self-start">
            <nav className="space-y-0.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Contents</p>
              {SECTIONS.map((s) => {
                const isActive = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-left text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}>
                    <s.icon className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? s.color : undefined }} strokeWidth={1.5} />
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Cards */}
          <div className="space-y-5">
            {SECTIONS.map((section) => (
              <CookieCard key={section.id} section={section}
                expanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)} />
            ))}

            {/* Footer Statement */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="mt-12 p-8 sm:p-10 rounded-3xl text-center"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(96,165,250,0.08)' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Cookie Agreement</span>
              </div>
              <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mx-auto mb-8">
                By continuing to use Frontx, you agree to the use of cookies as described in this Cookie Policy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/"
                  className="px-7 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                  Back to Home
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/privacy"
                  className="px-7 py-3 border border-white/15 text-white rounded-xl font-medium text-sm hover:bg-white/5 transition-all duration-300">
                  Privacy Policy
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

function CookieCard({ section, expanded, onToggle }) {
  const { id, num, title, icon: Icon, color } = section;

  return (
    <motion.div id={id} initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-3xl scroll-mt-32 transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, #0f172a, #111827, #0f172a)',
        border: '1px solid rgba(96,165,250,0.06)',
        boxShadow: expanded
          ? `0 20px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(96,165,250,0.08), 0 0 40px ${color}08`
          : '0 4px 20px -4px rgba(0,0,0,0.3)',
      }}>

      {/* Header - Always visible, clickable */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 sm:gap-5 p-6 sm:p-7 text-left group/btn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color }} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            {num && <span className="text-slate-500 font-semibold">{num}.</span>}
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            {id === 'what-are-cookies' && 'Small files that help websites function properly'}
            {id === 'why-cookies' && 'Purpose and benefits of using cookies'}
            {id === 'types-of-cookies' && 'Different categories of cookies we deploy'}
            {id === 'improve-experience' && 'How cookies enhance your learning journey'}
            {id === 'managing-cookies' && 'Control your cookie preferences'}
            {id === 'third-party' && 'External services that may use cookies'}
            {id === 'security' && 'How we protect your data'}
            {id === 'updates' && 'When and how we update this policy'}
            {id === 'contact' && 'Get in touch with our team'}
          </p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden">
            <div className="px-6 sm:px-7 pb-7 pt-0">
              <div className="h-px w-full mb-6" style={{ background: `linear-gradient(to right, ${color}20, transparent)` }} />

              {id === 'what-are-cookies' && <WhatAreCookiesContent color={color} />}
              {id === 'why-cookies' && <WhyCookiesContent color={color} />}
              {id === 'types-of-cookies' && <TypesOfCookiesContent color={color} />}
              {id === 'improve-experience' && <ImproveExperienceContent color={color} />}
              {id === 'managing-cookies' && <ManagingCookiesContent color={color} />}
              {id === 'third-party' && <ThirdPartyContent color={color} />}
              {id === 'security' && <SecurityContent color={color} />}
              {id === 'updates' && <UpdatesContent color={color} />}
              {id === 'contact' && <ContactContent color={color} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WhatAreCookiesContent({ color }) {
  const points = [
    'Cookies are small text files stored on your device when you visit a website.',
    'They help websites remember your preferences, login status, and browsing activity.',
    'Cookies do not contain viruses or malware and cannot access files on your device.',
    'Frontx uses cookies to provide a seamless, personalized user experience.',
    'Most web browsers automatically accept cookies, but you can control this in your settings.',
    'Session cookies are temporary and deleted when you close your browser.',
    'Persistent cookies remain on your device until they expire or are manually deleted.',
  ];
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-5">
        Cookies are small files stored on a user's device. They help websites remember preferences and improve functionality. Frontx uses cookies to provide a better user experience and ensure our platform works as intended.
      </p>
      <ul className="space-y-3 mb-5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function WhyCookiesContent({ color }) {
  const points = [
    'Account authentication — Keep you logged in across sessions.',
    'User preferences — Remember your display settings, language, and theme choices.',
    'Platform performance — Optimize load times and reduce unnecessary server requests.',
    'Security protection — Detect suspicious activity and protect your account from unauthorized access.',
    'Improved navigation — Save your recent activity and help you find content faster.',
  ];
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-5">
        Frontx uses cookies for several important purposes that help maintain a smooth and secure experience on the platform.
      </p>
      <ul className="space-y-3 mb-5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function TypesOfCookiesContent({ color }) {
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-6">
        Frontx uses different types of cookies, each serving a specific purpose to enhance your experience on the platform.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {COOKIE_TYPES.map((type, i) => (
          <div key={i} className="p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${type.color}15`, border: `1px solid ${type.color}25` }}>
                <type.icon className="w-5 h-5" style={{ color: type.color }} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-white">{type.title}</h3>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed">{type.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ImproveExperienceContent({ color }) {
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-8">
        Cookies play a key role in creating a personalized and efficient learning environment on Frontx. Here's how they help:
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {EXPERIENCE_STEPS.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center text-center max-w-[140px]">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}>
                <step.icon className="w-6 h-6" style={{ color: step.color }} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-slate-300">{step.label}</span>
            </div>
            {i < EXPERIENCE_STEPS.length - 1 && (
              <div className="hidden sm:block w-16 h-px" style={{ background: `linear-gradient(to right, ${step.color}40, ${EXPERIENCE_STEPS[i + 1].color}40)` }} />
            )}
            {i < EXPERIENCE_STEPS.length - 1 && (
              <div className="sm:hidden w-px h-8" style={{ background: `linear-gradient(to bottom, ${step.color}40, ${EXPERIENCE_STEPS[i + 1].color}40)` }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <ul className="space-y-3">
        {[
          'Faster login — No need to re-enter credentials every session.',
          'Personalized experience — Platform adapts to your preferences.',
          'Saved preferences — Your settings persist across sessions.',
          'Improved platform stability — Cookies help identify and fix issues.',
          'Better navigation — Quick access to recently viewed content.',
        ].map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ManagingCookiesContent({ color }) {
  const points = [
    'Accept all cookies — Allow Frontx to use all cookie types for the best experience.',
    'Reject non-essential cookies — Block performance, functional, and analytics cookies while keeping essential ones.',
    'Clear browser cookies — Remove all stored cookies from your browser settings.',
    'Modify browser settings — Configure your browser to notify you when cookies are being set.',
    'Use cookie management tools — Install browser extensions that give you granular control over cookies.',
  ];
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-5">
        You have full control over how cookies are used on Frontx. You can manage your cookie preferences through the following methods:
      </p>
      <ul className="space-y-3 mb-5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="text-[15px] text-slate-400 leading-relaxed">
        Note: Disabling certain cookies may affect the functionality of some platform features. Essential cookies cannot be disabled as they are required for basic platform operation.
      </p>
    </>
  );
}

function ThirdPartyContent({ color }) {
  const points = [
    'Authentication providers — Help verify your identity and maintain secure login sessions.',
    'Cloud storage providers — Enable reliable storage and delivery of platform resources.',
    'Analytics tools — Help us understand usage patterns to improve the platform.',
  ];
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-5">
        Frontx may use trusted third-party services that deploy their own cookies. These services help us provide a secure and efficient platform.
      </p>
      <ul className="space-y-3 mb-5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="text-[15px] text-slate-400 leading-relaxed">
        These services may use their own cookies according to their respective privacy policies. We encourage you to review the privacy policies of any third-party services integrated with Frontx.
      </p>
    </>
  );
}

function SecurityContent({ color }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5" style={{ color }} strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-white">Security Commitment</h3>
      </div>
      <ul className="space-y-3">
        {[
          'Cookies do not store passwords or sensitive personal information.',
          'Cookies do not provide unauthorized access to your account or device.',
          'User information remains protected through encryption and security protocols.',
          'We regularly audit our cookie usage to ensure compliance with security standards.',
        ].map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpdatesContent({ color }) {
  const points = [
    'Frontx may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements.',
    'Significant updates will be communicated to users via email or platform notification.',
    'The "Last Updated" date at the top of this page will always reflect the most recent revision.',
    'Continued use of Frontx after changes take effect constitutes acceptance of the updated policy.',
  ];
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-5">
        We may update this Cookie Policy periodically to align with evolving platform features, legal requirements, or industry best practices.
      </p>
      <ul className="space-y-3 mb-5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ContactContent({ color }) {
  return (
    <>
      <p className="text-[15px] text-slate-300 leading-relaxed mb-6">
        If you have questions about this Cookie Policy or how we use cookies, please reach out through any of the following channels.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, label: 'Support Email', value: 'support@frontx.com', c: '#3b82f6' },
          { icon: HelpCircle, label: 'Help Center', value: 'help.frontx.com', c: '#8b5cf6' },
          { icon: Phone, label: 'Contact Team', value: '+1 (800) FRONTX', c: '#10b981' },
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2.5 mb-2">
              <item.icon className="w-4 h-4" style={{ color: item.c }} strokeWidth={1.5} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${item.c}99` }}>{item.label}</span>
            </div>
            <p className="text-sm font-medium text-slate-200">{item.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default CookiePolicyPage;
