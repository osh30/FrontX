import { motion } from 'framer-motion';
import { useEffect } from 'react';
import logo from '../assets/logo/frontx-logo.svg';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.9, times: [0, 0.05, 0.8, 1], ease: 'easeInOut' }}
    >
      <div className="absolute -top-1/4 -left-1/4 w-[80vmax] h-[80vmax] rounded-full bg-[radial-gradient(circle,rgba(191,219,254,0.65),transparent_70%)] blur-[140px]" />
      <div className="absolute -bottom-1/3 -right-1/4 w-[80vmax] h-[80vmax] rounded-full bg-[radial-gradient(circle,rgba(221,214,254,0.6),transparent_70%)] blur-[140px]" />
      <div className="absolute top-1/3 -right-1/3 w-[60vmax] h-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(233,213,255,0.55),transparent_70%)] blur-[160px]" />
      <div className="absolute -bottom-1/4 left-1/4 w-[70vmax] h-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.5),transparent_70%)] blur-[180px]" />

      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0.85, 1], scale: [0.6, 1.1, 1, 1.05] }}
          transition={{ duration: 2.2, times: [0, 0.5, 0.75, 1], ease: 'easeOut' }}
        >
          <div className="w-[38vmin] h-[38vmin] rounded-full bg-[radial-gradient(circle,rgba(60,147,255,0.28),transparent_65%)] blur-[80px]" />
        </motion.div>

        <motion.img
          src={logo}
          alt="FrontX Logo"
          className="relative z-10 w-56 h-56 object-contain"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
