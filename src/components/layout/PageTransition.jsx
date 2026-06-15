// ─── PageTransition ───
// Framer Motion wrapper for smooth route transitions.

import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.99,
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
