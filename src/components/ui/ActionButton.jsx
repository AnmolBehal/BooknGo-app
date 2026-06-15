// ─── ActionButton ───
// Smart polymorphic CTA: "Reserve" (dining) opens TimeSlotModal, "Add" (movie/event) shows qty selector.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Clock } from 'lucide-react';

const ActionButton = ({ type = 'movie', onAction, item, className = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const [qty, setQty]           = useState(1);

  // ── Dining: triggers time-slot modal via onAction ──
  if (type === 'dining') {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onAction?.({ ...item, action: 'reserve' })}
        className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-glow-accent transition-all ${className}`}
      >
        <Clock className="w-4 h-4" />
        Reserve
      </motion.button>
    );
  }

  // ── Movie / Event / Sport / Stay: expandable qty selector ──
  if (!expanded) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setExpanded(true)}
        className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold rounded-xl shadow-glow-blue transition-all ${className}`}
      >
        <Plus className="w-4 h-4" />
        Add
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: 80, opacity: 0.8 }}
        animate={{ width: 'auto', opacity: 1 }}
        className={`flex items-center gap-1 bg-surface-700 border border-brand-500/30 rounded-xl overflow-hidden ${className}`}
      >
        {/* Decrement */}
        <button
          onClick={() => {
            if (qty <= 1) { setExpanded(false); setQty(1); return; }
            setQty(qty - 1);
          }}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Quantity */}
        <span className="text-white font-bold text-sm w-8 text-center">{qty}</span>

        {/* Increment */}
        <button
          onClick={() => setQty(qty + 1)}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Add to Itinerary */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onAction?.({ ...item, quantity: qty });
            setExpanded(false);
            setQty(1);
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-r-xl transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActionButton;
