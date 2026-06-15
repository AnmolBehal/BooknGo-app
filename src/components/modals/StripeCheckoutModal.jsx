// ─── StripeCheckoutModal ───
// Full Stripe Elements integration with real card input fields.
// Uses PaymentIntent flow: backend creates intent → frontend collects card → confirms payment.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  X, CreditCard, Lock, ShieldCheck, CheckCircle2, 
  Loader2, AlertCircle, Sparkles 
} from 'lucide-react';
import { getStripe, createPaymentIntent } from '../../services/stripe';
import { createBooking } from '../../services/firestore';
import { toast } from 'react-toastify';

// ─── Stripe Element Styling ───
const CARD_ELEMENT_STYLE = {
  style: {
    base: {
      color: '#e4e4e7',           // zinc-200
      fontFamily: '"Inter", "Space Grotesk", sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#71717a',         // zinc-500
      },
      iconColor: '#818cf8',       // indigo-400
    },
    invalid: {
      color: '#f87171',           // red-400
      iconColor: '#f87171',
    },
  },
};

// ─── Payment Form (inside Elements provider) ───
const PaymentForm = ({ items, totalPrice, totalItems, user, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState('form');  // form | success
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
  const [billingName, setBillingName] = useState(
    user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || ''
  );

  const isCardComplete = cardComplete.number && cardComplete.expiry && cardComplete.cvc && billingName.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !isCardComplete || isProcessing) return;

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setErrorMessage('Card details are not fully loaded.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create PaymentIntent on backend (uses SECRET key)
      const totalWithGST = Math.round(totalPrice * 1.18);
      const { clientSecret } = await createPaymentIntent(totalWithGST, {
        uid: user?.uid || 'guest',
        email: user?.email || '',
        userName: billingName,
      });

      // 2. Confirm payment with card details (uses PUBLISHABLE key)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingName,
            email: user?.email || '',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Save booking to Firestore
        const bookingId = await createBooking({
          uid: user?.uid || 'guest',
          email: user?.email || '',
          userName: billingName,
          items: items.map(({ id, type, title, price, quantity, meta }) => ({
            id, type, title, price, quantity, meta,
          })),
          totalPrice: totalWithGST,
          bookedVerticals: [...new Set(items.map(i => i.type))],
          paymentMethod: 'stripe',
          paymentStatus: 'paid',
          stripePaymentIntentId: paymentIntent.id,
        });

        setStep('success');

        setTimeout(() => {
          onSuccess?.({ bookingId, items, totalPrice: totalWithGST });
        }, 2500);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setIsProcessing(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={resetAndClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">Secure Checkout</h2>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Powered by Stripe
                </p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              disabled={isProcessing}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ── Card Input Form ── */}
            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className={isProcessing ? "opacity-70 pointer-events-none" : ""}
              >
                {/* Order Summary */}
                <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-2 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-2.5">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-400 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-sm text-zinc-400">{totalItems} items + 18% GST</span>
                  </div>
                  <span className="text-xl font-bold text-gradient">
                    ₹{Math.round(totalPrice * 1.18).toLocaleString('en-IN')}
                  </span>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* Card Input Fields */}
                <div className="space-y-4 mb-6">
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isProcessing}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-70"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Card Number
                    </label>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <CardNumberElement
                        options={CARD_ELEMENT_STYLE}
                        onChange={(e) => setCardComplete(prev => ({ ...prev, number: e.complete }))}
                      />
                    </div>
                  </div>

                  {/* Expiry + CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Expiry Date
                      </label>
                      <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <CardExpiryElement
                          options={CARD_ELEMENT_STYLE}
                          onChange={(e) => setCardComplete(prev => ({ ...prev, expiry: e.complete }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                        CVC
                      </label>
                      <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <CardCvcElement
                          options={CARD_ELEMENT_STYLE}
                          onChange={(e) => setCardComplete(prev => ({ ...prev, cvc: e.complete }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <motion.button
                  type="submit"
                  whileHover={isCardComplete && !isProcessing ? { scale: 1.02 } : {}}
                  whileTap={isCardComplete && !isProcessing ? { scale: 0.98 } : {}}
                  disabled={!stripe || !isCardComplete || isProcessing}
                  className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-base
                    ${isCardComplete && !isProcessing
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{Math.round(totalPrice * 1.18).toLocaleString('en-IN')}
                    </>
                  )}
                </motion.button>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-600">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> SSL Encrypted</span>
                  <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> PCI Compliant</span>
                </div>

                {/* Test card hint */}
                <p className="mt-3 text-center text-xs text-zinc-600">
                  Test card: 4242 4242 4242 4242 · Any future date · Any CVC
                </p>
              </motion.form>
            )}

            {/* ── Success ── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    Payment Successful <Sparkles className="w-5 h-5 text-amber-400" />
                  </h3>
                  <p className="text-sm text-zinc-400 mb-2">
                    ₹{Math.round(totalPrice * 1.18).toLocaleString('en-IN')} paid successfully
                  </p>
                  <p className="text-xs text-zinc-600">Redirecting to confirmation...</p>
                </motion.div>
              </motion.div>
            )}

            {/* ── Error ── */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
                <p className="text-sm text-zinc-400 mb-6">{errorMessage}</p>
                <div className="flex gap-3">
                  <button
                    onClick={resetAndClose}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setStep('form'); setErrorMessage(''); }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Modal Wrapper (provides Stripe Elements context) ───
const StripeCheckoutModal = ({ isOpen, onClose, items, totalPrice, totalItems, user, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Elements stripe={getStripe()} options={{ locale: 'en' }}>
          <PaymentForm
            items={items}
            totalPrice={totalPrice}
            totalItems={totalItems}
            user={user}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      )}
    </AnimatePresence>
  );
};

export default StripeCheckoutModal;
