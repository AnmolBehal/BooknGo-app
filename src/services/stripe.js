// ─── Stripe Payment Service ───
// Client-side Stripe integration using Stripe Elements.
// Only the PUBLISHABLE KEY is used here (frontend).
// The SECRET KEY is used on the backend server (Vercel Serverless Functions in /api).

import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// In production (Vercel), requests to /api/ are automatically routed to serverless functions.
// In development, Vite will proxy /api/ requests to the local Express server or Vercel CLI.
const API_BASE_URL = '/api';

let stripePromise = null;

/**
 * Lazily load the Stripe instance using the PUBLISHABLE key only.
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Create a PaymentIntent on the backend server.
 * The server uses the SECRET key to create the intent.
 * Returns the clientSecret needed by Stripe Elements on the frontend.
 *
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {object} metadata - { uid, email, userName }
 * @returns {Promise<{ clientSecret: string, paymentIntentId: string }>}
 */
export async function createPaymentIntent(amount, metadata = {}) {
  const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert INR to paise
      currency: 'inr',
      metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment intent');
  }

  return response.json();
}

/**
 * Verify payment status from the backend.
 * @param {string} paymentIntentId
 */
export async function verifyPayment(paymentIntentId) {
  const response = await fetch(`${API_BASE_URL}/verify-payment?id=${paymentIntentId}`);
  return response.json();
}
