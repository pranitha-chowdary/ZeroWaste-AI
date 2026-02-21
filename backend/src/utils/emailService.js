const axios = require('axios');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getOTPEmailHTML = (otp, purpose) => {
  const labels = { registration: 'Complete Your Registration', login: 'Verify Your Login', 'password-reset': 'Reset Your Password' };
  return `<!DOCTYPE html><html><head><meta charset='utf-8'><style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;}
    .box{max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1);}
    .hdr{background:linear-gradient(135deg,#E85D04,#2D6A4F);padding:30px;text-align:center;}
    .hdr h1{color:#fff;margin:0;font-size:26px;}
    .body{padding:40px 30px;text-align:center;}
    .otp-box{background:#FFF8E7;border:2px dashed #E85D04;border-radius:8px;padding:20px;margin:25px 0;}
    .otp{font-size:40px;font-weight:bold;color:#E85D04;letter-spacing:10px;margin:8px 0;}
  </style></head><body>
  <div class='box'>
    <div class='hdr'><h1>ZeroWaste AI</h1></div>
    <div class='body'>
      <h2>${labels[purpose] || 'Email Verification'}</h2>
      <p>Use the code below to verify your email:</p>
      <div class='otp-box'>
        <p style='margin:0;color:#888;font-size:13px;'>Your OTP Code</p>
        <div class='otp'>${otp}</div>
        <p style='margin:6px 0 0;color:#888;font-size:12px;'>Valid for 10 minutes</p>
      </div>
      <p style='color:#999;font-size:13px;'>If you did not request this, ignore this email.</p>
    </div>
    <div style='background:#f8f8f8;padding:16px;text-align:center;font-size:12px;color:#888;'>© 2026 ZeroWaste AI</div>
  </div></body></html>`;
};

const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('OTP for ' + email + ': ' + otp + ' (no BREVO_API_KEY - dev mode)');
    return { success: true, messageId: 'dev-console' };
  }
  const labels = { registration: 'Complete Your Registration', login: 'Verify Your Login' };
  try {
    const r = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: 'ZeroWaste AI', email: process.env.BREVO_SENDER_EMAIL || 'lagadapatipranitha@gmail.com' },
      to: [{ email }],
      subject: (labels[purpose] || 'Email Verification') + ' - Your OTP Code',
      htmlContent: getOTPEmailHTML(otp, purpose),
    }, { headers: { 'api-key': apiKey, 'Content-Type': 'application/json' } });
    console.log('OTP email sent to ' + email + ' | ID: ' + r.data.messageId);
    return { success: true, messageId: r.data.messageId };
  } catch (err) {
    const msg = err.response && err.response.data ? err.response.data.message : err.message;
    console.error('Brevo error:', msg);
    console.log('OTP for ' + email + ': ' + otp + ' (console fallback)');
    return { success: true, messageId: 'console-fallback' };
  }
};

const sendWelcomeEmail = async (email, name, role) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  const msg = { restaurant: 'Start reducing food waste!', ngo: 'Thank you for joining!', customer: 'Enjoy pre-ordered meals!' };
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: 'ZeroWaste AI', email: process.env.BREVO_SENDER_EMAIL || 'lagadapatipranitha@gmail.com' },
      to: [{ email }],
      subject: 'Welcome to ZeroWaste AI!',
      htmlContent: '<h2>Welcome, ' + name + '!</h2><p>' + (msg[role] || 'Start making a difference!') + '</p>',
    }, { headers: { 'api-key': apiKey, 'Content-Type': 'application/json' } });
    console.log('Welcome email sent to ' + email);
  } catch (err) {
    const e = err.response && err.response.data ? err.response.data.message : err.message;
    console.error('Welcome email error:', e);
  }
};

module.exports = { generateOTP, sendOTPEmail, sendWelcomeEmail };
