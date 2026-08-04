import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Users, Shield, BookOpen, MessageSquare, Briefcase,
  PenTool, Ban, AlertTriangle, RefreshCw, Mail, HelpCircle, Phone,
  ArrowRight, ChevronDown, CheckCircle2, Handshake
} from 'lucide-react';
import LandingNavbar from './Landing/LandingNavbar';
import LandingFooter from './Landing/LandingFooter';

const SECTIONS = [
  { id: 'introduction', num: null, title: 'Introduction', icon: FileText, color: '#60a5fa' },
  { id: 'eligibility', num: 1, title: 'Eligibility', icon: Shield, color: '#3b82f6' },
  { id: 'user-accounts', num: 2, title: 'User Accounts', icon: Users, color: '#a78bfa' },
  { id: 'community-guidelines', num: 3, title: 'Community Guidelines', icon: MessageSquare, color: '#34d399' },
  { id: 'academic-resources', num: 4, title: 'Academic Resources', icon: BookOpen, color: '#fb923c' },
  { id: 'mentorship', num: 5, title: 'Mentorship & Communication', icon: Handshake, color: '#22d3ee' },
  { id: 'career-opportunities', num: 6, title: 'Career Opportunities', icon: Briefcase, color: '#fbbf24' },
  { id: 'user-content', num: 7, title: 'User Content', icon: PenTool, color: '#818cf8' },
  { id: 'account-suspension', num: 8, title: 'Account Suspension', icon: Ban, color: '#f87171' },
  { id: 'liability', num: 9, title: 'Limitation of Liability', icon: AlertTriangle, color: '#2dd4bf' },
  { id: 'changes', num: 10, title: 'Changes to Terms', icon: RefreshCw, color: '#c084fc' },
  { id: 'contact', num: 11, title: 'Contact Information', icon: Mail, color: '#60a5fa' },
];

const TERMS_CONTENT = {
  introduction: {
    intro: 'Welcome to Frontx. Frontx is a university career ecosystem designed to bridge the gap between university students and experienced alumni. Our platform connects students with mentors, career opportunities, academic resources, and a thriving professional community.',
    points: [],
    closing: 'By accessing or using Frontx, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the platform. These terms apply to all users, including students, alumni, mentors, and organizations that interact with Frontx.',
  },
  eligibility: {
    intro: 'To use Frontx, you must be a registered member of the platform. Registration requires you to provide accurate and truthful information about your identity, university affiliation, and academic background.',
    points: [
      'You must be at least 16 years of age to create a Frontx account.',
      'Students must be currently enrolled or have graduated within the past two years.',
      'Alumni must have a verified connection to a recognized university or educational institution.',
      'All information provided during registration must be accurate, current, and complete.',
      'You are responsible for keeping your login credentials secure and confidential.',
      'One person may not maintain multiple accounts on the platform.',
    ],
    closing: 'Frontx reserves the right to verify user identities and university affiliations. Accounts with inaccurate or misleading information may be suspended or permanently removed.',
  },
  'user-accounts': {
    intro: 'Your Frontx account is your personal gateway to the platform. You are fully responsible for all activity that occurs under your account, including any actions taken by others who may have access to your credentials.',
    points: [
      'Keep your password strong and unique. Do not share it with anyone.',
      'Enable two-factor authentication for added security if available.',
      'Notify Frontx immediately if you suspect unauthorized access to your account.',
      'You are responsible for updating your contact information to receive important notifications.',
      'Accounts that show signs of misuse, fraud, or policy violations may be temporarily or permanently suspended.',
      'You may delete your account at any time through your dashboard settings.',
    ],
    closing: 'Frontx will never ask for your password via email, phone, or any other communication channel. If you receive such a request, please report it to our support team immediately.',
  },
  'community-guidelines': {
    intro: 'Frontx is built on mutual respect and professionalism. Every user is expected to contribute to a positive and supportive environment. The following behaviors are strictly prohibited on the platform.',
    points: [
      'Harassment, bullying, intimidation, or threats directed at any individual or group.',
      'Posting or sharing content that is violent, discriminatory, sexually explicit, or otherwise harmful.',
      'Sharing false, misleading, or deliberately deceptive information about yourself or others.',
      'Spamming the platform with repetitive content, unsolicited promotions, or irrelevant messages.',
      'Misusing communication tools such as direct messages, comments, or mentorship channels.',
      'Impersonating another person, organization, or institution.',
      'Circumventing platform rules through technical means or alternative accounts.',
    ],
    closing: 'Violations of these guidelines may result in content removal, account warnings, temporary suspension, or permanent ban from the platform. Repeated violations will be escalated to our trust and safety team.',
  },
  'academic-resources': {
    intro: 'Frontx provides a library of academic and career resources contributed by alumni, mentors, and the community. These resources are designed to support your learning and professional development.',
    points: [
      'All resources on Frontx are provided for educational and informational purposes only.',
      'Users must respect the intellectual property rights of resource creators and owners.',
      'Downloading or redistributing resources outside the platform without explicit permission is prohibited.',
      'Resource quality and accuracy are the responsibility of the original contributor.',
      'Frontx does not guarantee the completeness or accuracy of third-party resources.',
      'Users may flag resources that they believe violate copyright or contain inaccurate information.',
    ],
    closing: 'If you believe that a resource on Frontx infringes on your intellectual property rights, please contact our support team with the relevant details so we can investigate promptly.',
  },
  mentorship: {
    intro: 'The mentorship feature connects students with experienced alumni for guidance and career advice. While Frontx facilitates these connections, we want to set clear expectations about how the platform supports mentorship relationships.',
    points: [
      'All mentorship communication must remain professional, respectful, and constructive.',
      'Mentors are not employees of Frontx and participate voluntarily in the mentorship program.',
      'Frontx is not responsible for any personal agreements, commitments, or arrangements made outside the platform.',
      'Session feedback and ratings help maintain the quality of the mentorship experience.',
      'Users should report any inappropriate behavior during mentorship sessions immediately.',
      'Mentorship relationships are between individual users; Frontx acts as a facilitator, not a party to the relationship.',
    ],
    closing: 'We encourage all participants to provide honest and constructive feedback after each mentorship session. This helps us continuously improve the matching process and overall experience.',
  },
  'career-opportunities': {
    intro: 'Frontx provides access to job postings, internships, and career opportunities shared by alumni, partner organizations, and the broader university network.',
    points: [
      'All hiring and selection decisions are made solely by the respective employers or organizations.',
      'Frontx does not guarantee employment, interviews, or selection for any opportunity.',
      'Job listings are provided for informational purposes and may change without notice.',
      'Users should verify opportunity details directly with the posting organization before applying.',
      'Frontx is not responsible for the hiring practices, workplace conditions, or decisions of third-party employers.',
      'Applicants are responsible for the accuracy of their applications and professional conduct during the hiring process.',
    ],
    closing: 'We work hard to curate quality opportunities on Frontx, but we encourage users to conduct their own due diligence when applying for positions or engaging with potential employers.',
  },
  'user-content': {
    intro: 'When you post content on Frontx, whether it is a community post, a resource, a comment, or a profile update, you retain full ownership of that content.',
    points: [
      'You own your content. Frontx does not claim ownership over anything you create or upload.',
      'By posting content on Frontx, you grant the platform a limited license to display, store, and share that content within the platform as needed to provide our services.',
      'You may delete your content at any time, and it will be removed from public view.',
      'Frontx reserves the right to remove content that violates our community guidelines or terms of service.',
      'Content that contains malware, spam, or is designed to harm other users will be removed immediately.',
      'You are solely responsible for ensuring that your content does not infringe on the rights of others.',
    ],
    closing: 'We respect your creative ownership. The license you grant to Frontx is limited to what is necessary to operate and improve the platform and does not extend to any use outside of Frontx services.',
  },
  'account-suspension': {
    intro: 'Frontx may restrict, suspend, or permanently remove accounts that violate these terms or engage in behavior that compromises the safety and integrity of the platform.',
    points: [
      'Repeated violations of community guidelines or terms of service.',
      'Fraudulent activity, including identity misrepresentation or fake accounts.',
      'Persistent misuse of platform features such as spamming, harassment, or data scraping.',
      'Security concerns, including suspected account compromise or unauthorized access attempts.',
      'Failure to comply with verification requirements or providing false registration information.',
    ],
    closing: 'If your account is suspended, you will receive a notification explaining the reason and duration of the suspension where applicable. For permanent removals, you may appeal the decision by contacting our support team within 30 days.',
  },
  liability: {
    intro: 'Frontx provides its services in good faith and strives to maintain a reliable, safe, and productive platform. However, like any online service, there are limitations to what we can guarantee.',
    points: [
      'Frontx is provided on an "as is" and "as available" basis without warranties of any kind.',
      'We do not guarantee uninterrupted access to the platform at all times.',
      'Frontx is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform.',
      'We are not responsible for the actions, decisions, or conduct of users, mentors, employers, or any third parties on or off the platform.',
      'Frontx does not guarantee the accuracy, completeness, or reliability of content posted by users or third parties.',
      'Users interact with mentors, alumni, and employers at their own discretion and risk.',
    ],
    closing: 'Our goal is to create the best possible experience for our community. If you experience issues with the platform, please reach out to our support team so we can address your concerns.',
  },
  changes: {
    intro: 'Frontx may update these Terms of Service from time to time to reflect changes in our platform, services, legal requirements, or community standards.',
    points: [
      'Users will be notified of significant changes to these terms via email or platform notification.',
      'The "Last Updated" date at the top of this page will always reflect the most recent revision.',
      'Continued use of Frontx after changes take effect constitutes acceptance of the updated terms.',
      'If you do not agree with updated terms, you may delete your account before the changes take effect.',
      'Material changes will be communicated with at least 30 days advance notice when possible.',
    ],
    closing: 'We encourage you to review these terms periodically to stay informed about how Frontx operates and how your data is handled.',
  },
  contact: {
    intro: 'If you have questions, concerns, or feedback about these Terms of Service, our team is here to help. Reach out through any of the following channels.',
    points: [],
    closing: '',
  },
};

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState(new Set(['introduction']));
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
                <FileText className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-slate-400">Last updated: July 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              Please read these terms carefully before using Frontx.
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contents</p>
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
              <TermCard key={section.id} section={section}
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
                <span className="text-sm font-semibold text-blue-300">Agreement Acknowledged</span>
              </div>
              <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mx-auto mb-8">
                By continuing to use Frontx, you acknowledge and agree to these Terms of Service.
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

function TermCard({ section, expanded, onToggle }) {
  const { id, num, title, icon: Icon, color } = section;
  const content = TERMS_CONTENT[id];

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
            {id === 'introduction' && 'Welcome to Frontx — your university career ecosystem'}
            {id === 'eligibility' && 'Who can use Frontx and registration requirements'}
            {id === 'user-accounts' && 'Account security and your responsibilities'}
            {id === 'community-guidelines' && 'Standards for respectful platform behavior'}
            {id === 'academic-resources' && 'Rules for educational content and resources'}
            {id === 'mentorship' && 'Professional conduct in mentorship interactions'}
            {id === 'career-opportunities' && 'Employment listings and application terms'}
            {id === 'user-content' && 'Ownership and licensing of your posted content'}
            {id === 'account-suspension' && 'When and why accounts may be restricted'}
            {id === 'liability' && 'Platform limitations and disclaimers'}
            {id === 'changes' && 'How we update these terms'}
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

              {content.intro && (
                <p className="text-[15px] text-slate-300 leading-relaxed mb-5">{content.intro}</p>
              )}

              {content.points.length > 0 && (
                <ul className="space-y-3 mb-5">
                  {content.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-slate-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, opacity: 0.6 }} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {content.closing && (
                <p className="text-[15px] text-slate-400 leading-relaxed">{content.closing}</p>
              )}

              {id === 'contact' && (
                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: Mail, label: 'Support Email', value: 'support@frontx.com', c: '#3b82f6' },
                    { icon: HelpCircle, label: 'Help Center', value: 'help.frontx.com', c: '#8b5cf6' },
                    { icon: Phone, label: 'Contact Team', value: '+1 (800) FRONTX', c: '#10b981' },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <item.icon className="w-4 h-4" style={{ color: item.c }} strokeWidth={1.5} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${item.c}99` }}>{item.label}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TermsPage;
