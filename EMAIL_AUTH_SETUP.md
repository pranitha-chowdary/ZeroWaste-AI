# 📧 Email OTP Authentication Setup Guide

## Overview
Your ZeroWaste AI platform now features **real-time email authentication with OTP (One-Time Password) verification** for enhanced security. All users except administrators must verify their email addresses using a 6-digit OTP code.

---

## 🚀 Features Implemented

✅ **Real Email Validation** - Only valid email addresses are accepted
✅ **OTP Sent to Actual Email** - 6-digit code sent via email service
✅ **10-Minute Expiry** - OTPs expire after 10 minutes for security
✅ **5 Attempt Limit** - Maximum 5 verification attempts per OTP
✅ **Resend Functionality** - Users can request new OTP codes
✅ **Beautiful Email Templates** - Professional HTML email design
✅ **Admin Bypass** - Admins login directly without OTP
✅ **Welcome Emails** - Automated welcome message after successful registration

---

## 🔧 Gmail Setup (Required for Production)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password

1. Visit: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other** (enter "ZeroWaste AI")
4. Click **Generate**
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File

Edit `/backend/.env`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # The 16-char app password (without spaces)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Important:** Use the App Password, NOT your regular Gmail password!

---

## 📝 How It Works

### Registration Flow:
```
1. User enters details → 2. OTP sent to email → 3. User enters OTP → 4. Account created → 5. Welcome email sent
```

### Login Flow:
```
For Regular Users:
1. Enter email/password → 2. OTP sent to email → 3. Enter OTP → 4. Access granted

For Admins:
1. Enter email/password → 2. Direct access (no OTP)
```

---

## 🧪 Testing

### Development Mode (No Real Emails)

For testing without configuring real email, the system will log OTP codes to the console:

```bash
# Start backend
cd backend
npm start

# Check console for OTP codes
OTP Email sent: <message-id>
# OTP will be logged in development mode
```

### Production Mode (Real Emails)

1. Configure Gmail credentials in `.env`
2. Restart backend server
3. Register with your real email address
4. Check your email inbox for OTP code
5. Enter OTP to complete registration

---

## 📧 Email Templates

### OTP Email Features:
- ✅ Professional gradient design
- ✅ Large, easy-to-read code
- ✅ Countdown timer display
- ✅ Purpose-specific messaging
- ✅ Mobile-responsive layout

### Welcome Email Features:
- ✅ Personalized greeting
- ✅ Role-specific onboarding tips
- ✅ Direct login link
- ✅ Brand consistency

---

## 🔒 Security Features

1. **Time-Limited OTPs** - Expire after 10 minutes
2. **Attempt Limiting** - Max 5 incorrect attempts
3. **One-Time Use** - OTPs deleted after successful verification
4. **Auto-Expiry** - MongoDB TTL index removes expired OTPs
5. **Rate Limiting** - Prevents OTP spam (can be enhanced)

---

## 🎯 User Experience

### OTP Verification Screen:
- 6 separate input boxes for each digit
- Auto-focus next input on entry
- Paste support for full 6-digit code
- Auto-submit when all digits entered
- Countdown timer display
- One-click resend button
- Disabled resend during cooldown
- Clear error messages

---

## 🛠 API Endpoints

### Registration:
```
POST /api/auth/register
→ Sends OTP to email

POST /api/auth/verify-registration
{ email, otp, userData }
→ Verifies OTP and creates account
```

### Login:
```
POST /api/auth/login
→ Sends OTP (or direct login for admin)

POST /api/auth/verify-login
{ email, otp }
→ Verifies OTP and returns token
```

### Resend:
```
POST /api/auth/resend-otp
{ email, purpose: 'registration' | 'login' }
→ Sends new OTP
```

---

## 🐛 Troubleshooting

### Issue: "Failed to send OTP email"

**Solution:**
1. Check Gmail App Password is correct
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Ensure 2FA is enabled on Google Account
4. Check backend server logs for detailed error

### Issue: "OTP expired"

**Solution:**
- OTPs expire after 10 minutes
- Click "Resend OTP" to get a new code
- Check email spam folder for the OTP email

### Issue: "Invalid OTP"

**Solution:**
- Ensure you're entering the latest OTP
- Check for typos in the 6-digit code
- Maximum 5 attempts allowed per OTP

### Issue: "Email not receiving OTP"

**Solution:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check backend server is running
4. Review backend logs for email errors
5. Ensure Gmail credentials are configured

---

## 🔄 Reverting to Simple Auth (No OTP)

If you want to disable OTP temporarily:

1. Comment out email configuration in `.env`
2. The system will log OTP to console instead
3. Check terminal for OTP codes during development

---

## 📊 Database Collections

### OTP Collection:
```javascript
{
  email: String,
  otp: String (6 digits),
  purpose: 'registration' | 'login',
  verified: Boolean,
  attempts: Number,
  expiresAt: Date,
  createdAt: Date
}
```

**Auto-deletion:** MongoDB TTL index removes expired OTPs automatically.

---

## ✅ Testing Checklist

- [ ] Gmail App Password generated
- [ ] .env file updated with credentials
- [ ] Backend server restarted
- [ ] Test registration with real email
- [ ] Verify OTP email received
- [ ] Test OTP verification
- [ ] Check welcome email received
- [ ] Test login with OTP
- [ ] Test admin login (no OTP)
- [ ] Test OTP resend functionality
- [ ] Test OTP expiry (wait 10 minutes)
- [ ] Test invalid OTP handling

---

## 📞 Support

For email service issues:
- **Gmail Help:** https://support.google.com/accounts/answer/185833
- **App Passwords:** https://myaccount.google.com/apppasswords
- **SMTP Settings:** https://support.google.com/mail/answer/7126229

---

## 🎉 Success!

Your ZeroWaste AI platform now has enterprise-grade email authentication! Users will receive professional OTP emails and welcome messages, enhancing security and user experience.

**Next Steps:**
1. Configure your Gmail credentials
2. Test with your own email
3. Share test feedback
4. Deploy to production!

Happy coding! 🚀
