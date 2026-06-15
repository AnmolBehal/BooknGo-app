// ─── Twilio WhatsApp Service ───
// Sends WhatsApp booking alerts via a serverless webhook (e.g., Firebase Functions, Vercel).
// The webhook should accept POST { to, body } and call Twilio's API server-side
// to avoid exposing your Twilio Account SID / Auth Token on the client.

const TWILIO_WEBHOOK = import.meta.env.VITE_TWILIO_WEBHOOK_URL || '';

/**
 * Send a WhatsApp booking alert.
 * @param {object} params
 * @param {string} params.phone    - Recipient phone (with country code, e.g., +919876543210)
 * @param {string} params.message  - The message body
 */
export async function sendWhatsAppAlert({ phone, message }) {
  if (!TWILIO_WEBHOOK) {
    console.warn('[Twilio] Webhook URL not configured. Skipping WhatsApp alert.');
    return null;
  }

  try {
    const res = await fetch(TWILIO_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:   `whatsapp:${phone}`,
        body: message,
      }),
    });

    const data = await res.json();
    console.log('[Twilio] WhatsApp alert sent:', data);
    return data;
  } catch (err) {
    console.error('[Twilio] Failed to send WhatsApp alert:', err);
    return null;
  }
}
