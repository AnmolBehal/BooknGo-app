// ─── Success Page (Post-Purchase) ───
// Shows booking confirmation, triggers EmailJS + Twilio asynchronously, and displays cross-sell.

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sendBookingReceipt } from '../services/emailjs';
import { sendWhatsAppAlert } from '../services/twilio';
import { CheckCircle, Home, Download, ArrowRight } from 'lucide-react';

const Success = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { bookingId, items, totalPrice } = location.state || {};

  // ── Fire-and-forget notifications ──
  useEffect(() => {
    if (!bookingId || !user) return;

    const itemsSummary = (items || [])
      .map((i) => `${i.title} x${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`)
      .join('\n');

    // EmailJS receipt (async, non-blocking)
    sendBookingReceipt({
      toName:      user.displayName || user.firstName || 'User',
      toEmail:     user.email,
      bookingId,
      itemsSummary,
      totalPrice:  totalPrice || 0,
    });

    // Twilio WhatsApp (async, non-blocking)
    if (user.phone) {
      sendWhatsAppAlert({
        phone:   user.phone,
        message: `🎫 BooknGo Booking Confirmed!\n\nBooking ID: ${bookingId}\nTotal: ₹${(totalPrice || 0).toLocaleString('en-IN')}\n\n${itemsSummary}\n\nThank you for booking with BooknGo!`,
      });
    }
  }, [bookingId, user, items, totalPrice]);

  // Determine booked verticals for cross-sell
  const bookedTypes = [...new Set((items || []).map((i) => i.type))];
  const hasMovie = bookedTypes.includes('movie');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100 ">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* ═══ Confirmation ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">Booking Confirmed! 🎉</h1>
          <p className="text-slate-400 text-lg mb-2">Thank you for your booking</p>
          {bookingId && (
            <p className="text-sm text-slate-500 font-mono">Booking ID: {bookingId}</p>
          )}
        </motion.div>

        {/* ═══ Booking Summary ═══ */}
        {items && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl mb-8"
          >
            <h3 className="font-display font-bold text-white text-lg mb-4">Your Bookings</h3>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-slate-400">x{item.quantity}</p>
                  </div>
                  <p className="text-brand-400 font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 text-lg font-bold">
                <span className="text-white">Total Paid</span>
                <span className="text-gradient">₹{(totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ Cross-Sell / Recommendations ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl mb-8"
        >
          <h3 className="font-display font-bold text-white text-lg mb-4">
            {hasMovie ? '🍽️ Complete Your Evening' : '✨ You Might Also Like'}
          </h3>
          <p className="text-slate-400 mb-4 text-sm">
            {hasMovie
              ? "You've booked a movie — how about dinner nearby?"
              : 'Explore more experiences on BooknGo'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(hasMovie
              ? [
                  { label: 'Dining', emoji: '🍽️', path: '/dining' },
                  { label: 'Events', emoji: '🎭', path: '/events' },
                  { label: 'Stays',  emoji: '🏨', path: '/stays' },
                ]
              : [
                  { label: 'Movies', emoji: '🎬', path: '/movies' },
                  { label: 'Sports', emoji: '⚽', path: '/sports' },
                  { label: 'Dining', emoji: '🍽️', path: '/dining' },
                ]
            ).map((rec, i) => (
              <Link key={i} to={rec.path}>
                <div className="bg-surface-700/50 hover:bg-surface-600/50 border border-white/5 hover:border-brand-500/20 rounded-xl p-4 text-center transition-all cursor-pointer group">
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{rec.emoji}</span>
                  <span className="text-sm font-medium text-white flex items-center justify-center gap-1">
                    {rec.label} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ═══ Actions ═══ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-5 h-5" /> Back to Home
          </Link>
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Download className="w-5 h-5" /> View Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
