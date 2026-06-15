// ─── AccordionSection ───
// Expandable section for "Things to Know", FAQ, etc.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="font-medium text-white text-sm group-hover:text-brand-400 transition-colors">
          {title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-slate-400 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AccordionSection = ({ title, items = [] }) => {
  return (
    <div className="glass-card rounded-xl p-5">
      {title && (
        <h3 className="font-display font-bold text-white text-lg mb-3">{title}</h3>
      )}
      {items.map((item, i) => (
        <AccordionItem key={i} title={item.title} defaultOpen={i === 0}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export { AccordionItem };
export default AccordionSection;
