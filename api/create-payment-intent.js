import Stripe from 'stripe';

export default async function handler(req, res) {
  // Add CORS headers for local development testing (Vite proxy usually handles this, but good practice)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key is not configured on the Vercel server.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in smallest currency unit
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error.message);
    res.status(500).json({ error: error.message });
  }
}
