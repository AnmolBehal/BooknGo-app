// ─── SeatMapModal ───
// Interactive CSS Grid seat selector with VIP/Premium/Standard tiers.

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MonitorSmartphone } from 'lucide-react';
import { generateSeatMap } from '../../utils/showtimeGenerator';

const SeatMapModal = ({ isOpen, onClose, movieId, cinemaName, showtime, onConfirm }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const seatMap = useMemo(() => {
    if (!movieId || !cinemaName || !showtime) return null;
    return generateSeatMap(movieId, cinemaName, showtime);
  }, [movieId, cinemaName, showtime]);

  const toggleSeat = (seat, tierPrice) => {
    if (seat.disabled) return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      return [...prev, { ...seat, price: tierPrice }];
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleConfirm = () => {
    if (selectedSeats.length === 0) return;
    onConfirm({
      seats:      selectedSeats,
      totalPrice,
      cinema:     cinemaName,
      showtime,
    });
    setSelectedSeats([]);
    onClose();
  };

  if (!isOpen || !seatMap) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="seatmap-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] glass-overlay flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="seatmap-modal"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-2xl glass-card rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-display font-bold text-white text-lg">Select Your Seats</h2>
              <p className="text-sm text-slate-400">{cinemaName} · {showtime}</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Screen Indicator */}
          <div className="px-5 pt-6 pb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MonitorSmartphone className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-widest">Screen This Way</span>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent rounded-full mb-6" />
          </div>

          {/* Seat Grid */}
          <div className="px-5 pb-4 max-h-[45vh] overflow-y-auto hide-scrollbar">
            {seatMap.tiers.map((tier) => (
              <div key={tier.tierKey} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded" style={{ background: tier.color }} />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{tier.label}</span>
                  <span className="text-xs text-slate-500">— ₹{tier.price}</span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  {tier.rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-1">
                      <span className="w-5 text-[10px] text-slate-600 text-right mr-1">
                        {String.fromCharCode(65 + rowIdx)}
                      </span>
                      {row.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat, tier.price)}
                            disabled={seat.disabled}
                            className={`seat
                              ${seat.disabled ? 'seat-disabled' : isSelected ? 'seat-selected' : 'seat-available'}
                              ${tier.tierKey === 'VIP' ? 'seat-vip' : tier.tierKey === 'PREMIUM' ? 'seat-premium' : ''}
                            `}
                            title={seat.disabled ? 'Unavailable' : `${tier.label} — ₹${tier.price}`}
                          >
                            {seat.disabled ? '×' : isSelected ? '✓' : (seat.col + 1)}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><div className="seat seat-available w-5 h-5 text-[8px]">1</div> Available</div>
            <div className="flex items-center gap-1.5"><div className="seat seat-selected w-5 h-5 text-[8px]">✓</div> Selected</div>
            <div className="flex items-center gap-1.5"><div className="seat seat-disabled w-5 h-5 text-[8px]">×</div> Booked</div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xl font-bold text-white">₹{totalPrice.toLocaleString('en-IN')}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={selectedSeats.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl shadow-glow-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Seats
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SeatMapModal;
