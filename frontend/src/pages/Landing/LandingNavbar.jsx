import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo/frontx-logo.svg';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white dark:bg-[#0B1220] landing-nav border-b border-gray-100/50 dark:border-white/10 overflow-visible ${
        scrolled ? 'shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2' : 'py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto pl-6 pr-4 xl:pl-8 xl:pr-5">
        <div className="flex justify-between items-center">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2.5">
            <img src={logo} alt="Frontx logo" className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className="landing-brand text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-white bg-clip-text text-transparent tracking-tight">
              Frontx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Community', 'Testimonials'].map((item) => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[17px] font-semibold text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-[17px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/register" 
              className="group relative px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-[15px] font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-blue-500/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {['Features', 'How it Works', 'Community', 'Testimonials'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => document.getElementById(item.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' }), 300);
                  }}
                  className="text-base font-medium text-gray-600 text-left"
                >
                  {item}
                </button>
              ))}
              <hr className="border-gray-100 my-2" />
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" className="w-full py-3 text-center text-gray-700 font-medium border border-gray-200 rounded-xl">Log in</Link>
                <Link to="/register" className="w-full py-3 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-medium rounded-xl">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default LandingNavbar;
