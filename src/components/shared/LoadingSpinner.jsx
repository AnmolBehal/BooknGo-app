// ─── LoadingSpinner ───
// Full-screen loading state with animated gradient pulse.

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...', compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-900">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" />
      </div>

      {/* Spinner */}
      <motion.div
        className="relative w-16 h-16 mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-400 border-r-accent-400" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-brand-300 border-l-accent-300" />
      </motion.div>

      {/* Brand */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold text-gradient mb-2"
      >
        BooknGo
      </motion.p>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
