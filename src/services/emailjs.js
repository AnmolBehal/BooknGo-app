// ─── EmailJS Service ───
// Sends booking confirmation receipts via EmailJS.
// Configure your EmailJS template with variables: {to_name, to_email, booking_id, items_summary, total_price}

import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY   || '';

/**
 * Send a booking confirmation email.
 * @param {object} params
 * @param {string} params.toName      - Recipient name
 * @param {string} params.toEmail     - Recipient email
 * @param {string} params.bookingId   - Firestore booking document ID
 * @param {string} params.itemsSummary - Human-readable summary of booked items
 * @param {number} params.totalPrice  - Total amount in INR
 */
export async function sendBookingReceipt({ toName, toEmail, bookingId, itemsSummary, totalPrice }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[EmailJS] Missing configuration. Skipping email.');
    return null;
  }

  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_name:      toName,
        to_email:     toEmail,
        booking_id:   bookingId,
        items_summary: itemsSummary,
        total_price:  `₹${totalPrice.toLocaleString('en-IN')}`,
        app_name:     'BooknGo',
      },
      PUBLIC_KEY
    );
    console.log('[EmailJS] Receipt sent:', result.status);
    return result;
  } catch (err) {
    console.error('[EmailJS] Failed to send receipt:', err);
    return null;
  }
}
