import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingHeroVisual from './LandingHeroVisual';

const scrollToFeatures = () => {
  const features = document.getElementById('features');
  if (features) {
    features.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const LandingHero = () => {
  return (
    <section className="relative min-h-screen pt-[96px] pb-6 sm:pt-[96px] sm:pb-8 lg:pt-[110px] lg:pb-10 overflow-hidden bg-white dark:bg-[#0B1220] flex items-center">
      {/* Absolute Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[60px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50/50 rounded-full blur-[60px]" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-cyan-50/30 rounded-full blur-[50px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-black dark:text-white leading-[1.1] mb-6">
              Bridge your future with alumni wisdom
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed font-medium">
              Join a premium network where university students and accomplished alumni collaborate, share knowledge, and build extraordinary careers through AI-driven guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register"
                className="group relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-2xl overflow-hidden shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <button 
                onClick={scrollToFeatures}
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-lg"
              >
                <Play className="w-5 h-5" />
                Explore Platform
              </button>
            </div>
          </motion.div>

          {/* Right Column - Premium Animated Ecosystem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[5/6] xl:aspect-[4/5] max-h-[50vh] sm:max-h-[55vh] lg:max-h-[75vh] xl:max-h-[80vh] will-change-transform"
          >
            <div className="absolute inset-0 rounded-[32px] overflow-hidden">
              <LandingHeroVisual />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LandingHero;
