// ─── Itinerary Page (Universal Bag) ───
// Shows all items added across verticals, grouped by type.
// Integrated with Stripe payment gateway.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useItinerary } from '../context/ItineraryContext';
import { useAuth } from '../context/AuthContext';
import { VERTICAL_META } from '../utils/constants';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, CreditCard, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import StripeCheckoutModal from '../components/modals/StripeCheckoutModal';

const Itinerary = () => {
  const { items, groupedItems, totalItems, totalPrice, removeItem, updateQty, clearAll } = useItinerary();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = ({ bookingId, items: bookedItems, totalPrice: paid }) => {
    clearAll();
    setCheckoutOpen(false);
    toast.success('Payment successful! Booking confirmed! 🎉');
    navigate('/success', { state: { bookingId, items: bookedItems, totalPrice: paid } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100 ">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="font-display font-bold text-xl text-gradient">My Itinerary</h1>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-700/50 flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-3">Your itinerary is empty</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              Start exploring Movies, Events, Sports, Dining & Stays to add items to your plan.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <ShoppingBag className="w-5 h-5" /> Start Exploring
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedItems).map(([type, typeItems]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{VERTICAL_META[type]?.icon}</span>
                    <h3 className="font-display font-bold text-white">{VERTICAL_META[type]?.label || type}</h3>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400">{typeItems.length}</span>
                  </div>
                  <AnimatePresence>
                    {typeItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="glass-card p-4 rounded-xl mb-3 flex gap-4"
                      >
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{item.title}</h4>
                          {item.subtitle && <p className="text-sm text-slate-400 truncate">{item.subtitle}</p>}
                          <p className="text-brand-400 font-bold mt-1">₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2 bg-surface-700 rounded-lg">
                            <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1.5 hover:text-brand-400 transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1.5 hover:text-brand-400 transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 glass-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-white text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Items ({totalItems})</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Platform fee</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Checkout</>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        totalPrice={totalPrice}
        totalItems={totalItems}
        user={user}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Itinerary;
