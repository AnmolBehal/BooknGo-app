// ─── TimeSlotModal ───
// Time slot picker for dining reservations and event bookings.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, CalendarDays } from 'lucide-react';

const TIME_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '06:00 PM',
  '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM',
  '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM',
];

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimeSlotModal = ({ isOpen, onClose, title, onConfirm }) => {
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [guests, setGuests]               = useState(2);
  const [date, setDate]                   = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const handleConfirm = () => {
    if (!selectedSlot) return;
    onConfirm({ time: selectedSlot, guests, date });
    setSelectedSlot(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="timeslot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] glass-overlay flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          key="timeslot-modal"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md glass-card rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-display font-bold text-white text-lg">Reserve a Table</h2>
              {title && <p className="text-sm text-slate-400">{title}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Date */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                <CalendarDays className="w-4 h-4 text-brand-400" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-surface-700 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                <Users className="w-4 h-4 text-brand-400" /> Guests
              </label>
              <div className="flex flex-wrap gap-2">
                {GUEST_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGuests(g)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all
                      ${guests === g
                        ? 'bg-brand-600/30 text-brand-400 border border-brand-500/40'
                        : 'bg-surface-700 text-slate-400 border border-white/10 hover:bg-white/5'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                <Clock className="w-4 h-4 text-brand-400" /> Time Slot
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 rounded-xl text-xs font-medium transition-all
                      ${selectedSlot === slot
                        ? 'bg-brand-600/30 text-brand-400 border border-brand-500/40'
                        : 'bg-surface-700 text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={!selectedSlot}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-glow-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reserve for {guests} guest{guests !== 1 ? 's' : ''} {selectedSlot ? `at ${selectedSlot}` : ''}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TimeSlotModal;
