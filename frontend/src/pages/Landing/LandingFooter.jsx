import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  Sun,
  Moon,
  GraduationCap,
  Users,
  Briefcase,
  FileText,
  Award,
  LifeBuoy,
  HelpCircle,
  Mail,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Phone,
} from 'lucide-react';
import logo from '../../assets/logo/frontx-logo.svg';

const quickLinks = [
  { label: 'Student Portal', to: '/register', icon: GraduationCap },
  { label: 'Alumni Network', to: '/register', icon: Users },
  { label: 'Recruiters', to: '/register', icon: Briefcase },
  { label: 'Jobs & Internships', to: '/jobs', icon: FileText },
  { label: 'Support FrontX', to: '/donate', icon: Award },
];

const supportLinks = [
  { label: 'Help Center', to: '/help-center', icon: LifeBuoy },
  { label: 'FAQs', to: '/help-center', icon: HelpCircle },
  { label: 'Contact Us', to: '/help-center', icon: Mail },
  { label: 'Feedback', to: '/help-center', icon: MessageSquare },
  { label: 'Privacy Policy', to: '/privacy', icon: ShieldCheck },
  { label: 'Terms of Service', to: '/terms', icon: FileText },
];

const socialLinks = [
  {
    label: 'Facebook',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

const LandingFooter = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const stored = localStorage.getItem('landing-theme');
    if (stored === 'dark') {
      window.document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const next = !isDark;
    root.classList.add('theme-transition');
    root.classList.toggle('dark', next);
    localStorage.setItem('landing-theme', next ? 'dark' : 'light');
    setIsDark(next);
    setTimeout(() => root.classList.remove('theme-transition'), 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#2F3F55] to-[#36465D] border-t border-white/10 overflow-hidden">
      {/* Subtle decorative glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 xl:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 mb-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="group flex items-center gap-3 mb-6">
              <img
                src={logo}
                alt="FrontX logo"
                className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-bold text-white tracking-tight">
                FrontX
              </span>
            </Link>
            <p className="text-gray-400 text-[15px] leading-relaxed mb-5 max-w-xs">
              Connecting UFTB students, alumni, recruiters, and industry partners to build successful careers and bridge the gap between education and employment.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:text-white hover:bg-white/10 hover:border-blue-400/40 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(59,130,246,0.25)]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-[0.15em] uppercase mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:border-blue-400/40 group-hover:bg-blue-400/10 transition-all">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[15px] font-medium">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-[0.15em] uppercase mb-5">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:border-blue-400/40 group-hover:bg-blue-400/10 transition-all">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[15px] font-medium">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-[0.15em] uppercase mb-5">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="text-gray-400 text-[15px] leading-relaxed">
                  University of Frontier Technology Bangladesh (UFTB)
                  <br />
                  Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <a
                  href="tel:+880XXXXXXXXXX"
                  className="text-gray-400 text-[15px] hover:text-blue-400 transition-colors"
                >
                  +880-XXXXXXXXXX
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <a
                  href="mailto:support@frontx.uftb.ac.bd"
                  className="text-gray-400 text-[15px] hover:text-blue-400 transition-colors break-all"
                >
                  support@frontx.uftb.ac.bd
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 FrontX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              Official UFTB Website
            </a>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-blue-400 hover:border-blue-400/40 transition-all"
              aria-label="Toggle dark / light theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Back to Top - floating */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_8px_30px_rgba(59,130,246,0.5)] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(59,130,246,0.6)] hover:scale-105"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default LandingFooter;
