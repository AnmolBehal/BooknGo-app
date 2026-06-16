import Stripe from 'stripe';

export default async function handler(req, res) {
  // Add CORS headers for local development testing
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key is not configured on the Vercel server.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    res.status(200).json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
