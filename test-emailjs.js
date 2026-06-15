import 'dotenv/config';

const SERVICE_ID = process.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.VITE_EMAILJS_PUBLIC_KEY;

if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
  console.error('Missing EmailJS credentials in .env');
  process.exit(1);
}

const data = {
  service_id: SERVICE_ID,
  template_id: TEMPLATE_ID,
  user_id: PUBLIC_KEY,
  template_params: {
    to_name: 'Test User',
    to_email: 'test@example.com', // Using a dummy email to prevent spamming real users, but will show success status
    booking_id: 'TEST-12345',
    items_summary: 'Test Movie x1 - Rs. 200',
    total_price: 'Rs. 200',
    app_name: 'BooknGo Test',
  }
};

async function testEmailJS() {
  console.log('Testing EmailJS credentials...');
  
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('✅ EmailJS is WORKING! Credentials are valid and email was accepted.');
    } else {
      const errorText = await response.text();
      console.error('❌ EmailJS Error:', response.status, errorText);
    }
  } catch (err) {
    console.error('❌ Network error:', err.message);
  }
}

testEmailJS();
