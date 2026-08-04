import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import { PlatformOverview } from './LandingFeatures';
import { HowItWorks } from './LandingProcess';
import { LiveCommunity, Testimonials, FinalCTA } from './LandingCommunity';
import LandingFooter from './LandingFooter';
import TrustedStatistics from './TrustedStatistics';
import { 
  AiCareerAnalysisStory, 
  FindAlumniMentorStory, 
  AttendMentorshipSessionStory, 
  JoinResearchStory, 
  AccessResourcesStory, 
  CareerOpportunitiesStory 
} from './LandingStory';
import { motion, useScroll, useSpring } from 'framer-motion';
import DonationSection from './DonationSection';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1220] font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
      {/* Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 origin-left z-50"
        style={{ scaleX: scaleY }}
      />
      
      <LandingNavbar />
      
      <main className="relative">
        {/* The Narrative Scroll Connection Line */}
        <div className="absolute left-8 lg:left-1/2 top-[100vh] bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-200 to-transparent -translate-x-1/2 hidden md:block z-0 pointer-events-none"></div>

        <LandingHero />
        <TrustedStatistics />
        <PlatformOverview />
        <HowItWorks />
        
        {/* Storytelling Journey */}
        <section className="pt-12 md:pt-16 pb-24 relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          <div className="max-w-7xl mx-auto px-6 xl:px-8 relative z-10">
            <AiCareerAnalysisStory />
            <FindAlumniMentorStory />
            <AttendMentorshipSessionStory />
            <JoinResearchStory />
            <AccessResourcesStory />
            <CareerOpportunitiesStory />
          </div>
        </section>

        <LiveCommunity />
        <Testimonials />
        <DonationSection />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
