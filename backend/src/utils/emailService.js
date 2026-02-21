const { Resend } = require('resend');

// Initialize Resend client
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP email HTML template
const getOTPEmailHTML = (otp, purpose) => {
  const purposeText = {
    'registration': 'Complete Your Registration',
    'login': 'Verify Your Login',
    'password-reset': 'Reset Your Password'
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #E85D04 0%, #2D6A4F 100%); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; }
    .content { padding: 40px 30px; text-align: center; }
    .otp-box { background: #FFF8E7; border: 2px dashed #E85D04; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .otp-code { font-size: 40px; font-weight: bold; color: #E85D04; letter-spacing: 10px; margin: 8px 0; }
    .footer { background: #f8f8f8; padding: 16px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🌱 ZeroWaste AI</h1></div>
    <div class="content">
      <h2>${purposeText[purpose] || 'Email Verification'}</h2>
      <p style="color:#555;">Use the code below to complete your verification:</p>
      <div class="otp-box">
        <p style="margin:0;color:#888;font-size:13px;">Your OTP Code</p>
        <div class="otp-code">${otp}</div>
        <p style="margin:6px 0 0;color:#888;font-size:12px;">Valid for 10 minutes</p>
      </div>
      <p style="color:#999;font-size:13px;">If you didn't request this, ignore this email.</p>
    </div>
    <div class="footer">© 2026 ZeroWaste AI. All rights reserved.</div>
  </div>
</body>
</html>`;
};

// Send OTP email via Resend
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const resend = getResendClient();

  // No API key — log to console (local dev fallback)
  if (!resend) {
    console.log('\n===========================================');
    console.log(' OTP (No RESEND_API_KEY — dev mode)');
    console.log('===========================================');
    console.log(` Email: ${email}`);
    console.log(` OTP Code: ${otp}`);
    console.log(` Purpose: ${purpose}`);
    console.log('===========================================\n');
    return { success: true, messageId: 'dev-console' };
  }

  const purposeText = {
    'registration': 'Complete Your Registration',
    'login': 'Verify Your Login',
    'password-reset': 'Reset Your Password'
  };

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZeroWaste AI <onboarding@resend.dev>',
      to: [email],
      subject: `${purposeText[purpose] || 'Verification'} — OTP: ${otp}`,
      html: getOTPEmailHTML(otp, purpose),
    });

    if (error) throw new Error(error.message);

    console.log(`✅ OTP email sent to ${email} | ID: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (err) {
    // Always fall back to console so registration never breaks
    console.error('❌ Resend error:', err.message);
    console.log('\n===========================================');
    console.log('⚠️  Email failed — Console fallback');
    console.log('===========================================');
    console.log(` Email: ${email}`);
    console.log(` OTP Code: ${otp}`);
    console.log(` Purpose: ${purpose}`);
    console.log('===========================================\n');
    return { success: true, messageId: 'console-fallback' };
  }
};

// Send welcome email via Resend
const sendWelcomeEmail = async (email, name, role) => {
  const resend = getResendClient();
  if (!resend) return;

  const roleMessages = {
    'restaurant': 'Start reducing food waste and helping your community!',
    'ngo': 'Thank you for joining us in fighting food waste!',
    'customer': 'Enjoy delicious pre-ordered meals while saving food!'
  };

  try {
    await resend.emails.send({
      from: 'ZeroWaste AI <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to ZeroWaste AI! 🌱',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#E85D04,#2D6A4F);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;">🎉 Welcome, ${name}!</h1>
        </div>
        <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <p>Your ZeroWaste AI account is now active.</p>
          <p><strong>${roleMessages[role] || 'Start making a difference!'}</strong></p>
          <p style="color:#888;font-size:12px;">© 2026 ZeroWaste AI</p>
        </div>
      </div>`,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error('Welcome email error:', err.message);
  }
};

module.exports = { generateOTP, sendOTPEmail, sendWelcomeEmail };
