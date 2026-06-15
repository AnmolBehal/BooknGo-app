// ─── Stripe Payment Server ───
// Minimal Express server that creates Stripe PaymentIntents.
// The SECRET KEY stays here on the server — never exposed to the browser.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.STRIPE_SERVER_PORT || 4242;

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

/**
 * POST /create-payment-intent
 * Creates a PaymentIntent for the given amount.
 * The client uses the returned clientSecret to confirm payment via Stripe Elements.
 */
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in smallest currency unit (paise for INR)
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /verify-payment/:id
 * Verify a payment intent status.
 */
app.get('/verify-payment/:id', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`💳 Stripe server running on http://localhost:${PORT}`);
});
