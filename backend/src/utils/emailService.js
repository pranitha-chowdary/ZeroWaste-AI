const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Gmail SMTP configuration with proper TLS settings
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates in development
      ciphers: 'SSLv3'
    },
    connectionTimeout: 5000, // 5 second connection timeout
    greetingTimeout: 5000,
    socketTimeout: 5000,
    debug: true, // Enable debug output
    logger: true // Log to console
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    // In development without email config, just log OTP
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('\n===========================================');
      console.log(' OTP VERIFICATION CODE (Development Mode)');
      console.log('===========================================');
      console.log(` Email: ${email}`);
      console.log(` OTP Code: ${otp}`);
      console.log(`Purpose: ${purpose}`);
      console.log(`⏱  Valid for: 10 minutes`);
      console.log('===========================================\n');
      console.log('  Configure EMAIL_USER and EMAIL_PASSWORD in .env to send real emails');
      return { success: true, messageId: 'dev-mode-no-email-sent' };
    }

    const transporter = createTransporter();

    // Add timeout wrapper for email sending (reduced to 8 seconds since transporter has 5s timeout)
    const sendWithTimeout = (transporter, mailOptions, timeout = 8000) => {
      return Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout')), timeout)
        )
      ]);
    };
    
    // Verify transporter before sending
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      throw new Error(`SMTP verification failed: ${verifyError.message}`);
    }

    const purposeText = {
      'registration': 'Complete Your Registration',
      'login': 'Verify Your Login',
      'password-reset': 'Reset Your Password'
    };

    const mailOptions = {
      from: `"ZeroWaste AI" <${process.env.EMAIL_USER || 'noreply@zerowaste.com'}>`,
      to: email,
      subject: `${purposeText[purpose] || 'Verification'} - OTP: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #E85D04 0%, #2D6A4F 100%);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .otp-box {
              background: linear-gradient(135deg, #FFF8E7 0%, #E8F5E9 100%);
              border: 2px dashed #E85D04;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #E85D04;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .footer {
              background: #f8f8f8;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .button {
              background: linear-gradient(135deg, #E85D04 0%, #2D6A4F 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 ZeroWaste AI</h1>
            </div>
            <div class="content">
              <h2>${purposeText[purpose] || 'Email Verification'}</h2>
              <p>Please use the following One-Time Password (OTP) to complete your verification:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you didn't request this code, please ignore this email.
              </p>
              
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  This is an automated email. Please do not reply to this message.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await sendWithTimeout(transporter, mailOptions, 10000);
      console.log('\n✅ OTP Email sent successfully!');
      console.log(`📧 To: ${email}`);
      console.log(`📨 Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (emailError) {
      console.error('❌ Error sending OTP email:', emailError.message);
      // Fallback to console for development/testing
      console.log('\n===========================================');
      console.log('⚠️  Email sending failed - Using console fallback');
      console.log('===========================================');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(`🎯 Purpose: ${purpose}`);
      console.log('⏱  Valid for: 10 minutes');
      console.log('===========================================\n');
      return { success: true, messageId: 'console-fallback' };
    }
  } catch (error) {
    console.error('❌ Fatal error in sendOTPEmail:', error.message);
    throw error;
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();

    const roleMessages = {
      'restaurant': 'Start reducing food waste and helping your community!',
      'ngo': 'Thank you for joining us in fighting food waste!',
      'customer': 'Enjoy delicious pre-ordered meals while saving food!'
    };

    const mailOptions = {
      from: `"ZeroWaste AI" <${process.env.EMAIL_USER || 'noreply@zerowaste.com'}>`,
      to: email,
      subject: 'Welcome to ZeroWaste AI! 🌱',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #E85D04 0%, #2D6A4F 100%); padding: 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
            .content { padding: 40px 30px; }
            .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome ${name}!</h1>
            </div>
            <div class="content">
              <h2>Your Account is Active</h2>
              <p>We're excited to have you join the ZeroWaste AI community!</p>
              <p><strong>${roleMessages[role] || 'Start making a difference today!'}</strong></p>
              
              <div style="background: #FFF8E7; border-left: 4px solid #E85D04; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>What's Next?</strong></p>
                <ul style="margin: 10px 0;">
                  ${role === 'restaurant' ? '<li>Set up your menu items</li><li>Monitor your inventory</li><li>Start donating surplus food</li>' : ''}
                  ${role === 'ngo' ? '<li>Browse available donations</li><li>Accept food donations</li><li>Track your impact</li>' : ''}
                  ${role === 'customer' ? '<li>Browse restaurant menus</li><li>Pre-order meals</li><li>Save food and money</li>' : ''}
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="http://localhost:5174/login" style="background: linear-gradient(135deg, #E85D04 0%, #2D6A4F 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Login to Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 ZeroWaste AI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};
