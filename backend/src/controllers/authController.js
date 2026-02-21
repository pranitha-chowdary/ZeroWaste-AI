const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

// @desc    Register a new user - Step 1: Send OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, restaurantName, ngoName, capacity, distance } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Store user data temporarily in session/memory (we'll create user after OTP verification)
    // For now, generate and send OTP
    const otp = generateOTP();
    
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, purpose: 'registration' });
    
    // Create new OTP record
    await OTP.create({
      email,
      otp,
      purpose: 'registration'
    });

    // Send OTP email (always proceed even if email fails — OTP shown in console as fallback)
    let emailSent = false;
    try {
      await sendOTPEmail(email, otp, 'registration');
      emailSent = true;
    } catch (emailError) {
      // Email failed — OTP already printed to console by emailService fallback
      console.error('❌ Email send error:', emailError.message);
      console.log('\n=== REGISTRATION OTP (email failed, use this) ===');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 OTP: ${otp}`);
      console.log('=================================================\n');
    }

    // Always return success — OTP is either in email or console
    res.status(200).json({
      message: emailSent
        ? 'OTP sent to your email address'
        : 'OTP generated (check server console - email service unavailable)',
      email,
      requiresOTP: true,
      emailSent,
      tempData: {
        name,
        email,
        role: role || 'customer',
        phone,
        location,
        restaurantName,
        ngoName,
        capacity,
        distance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and complete registration - Step 2
// @route   POST /api/auth/verify-registration
// @access  Public
const verifyRegistration = async (req, res) => {
  try {
    const { email, otp, userData } = req.body;
    const { name, password, role, phone, location, restaurantName, ngoName, capacity, distance } = userData;

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      purpose: 'registration',
      verified: false 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or invalid. Please request a new one.' });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.` 
      });
    }

    // OTP is valid, create user
    const userDataToCreate = {
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      location
    };

    // Add role-specific fields
    if (role === 'restaurant') {
      userDataToCreate.restaurantName = restaurantName;
      userDataToCreate.status = 'pending'; // Requires admin approval
    } else if (role === 'ngo') {
      userDataToCreate.ngoName = ngoName;
      userDataToCreate.capacity = capacity;
      userDataToCreate.distance = distance;
      userDataToCreate.status = 'pending'; // Requires admin approval
    } else {
      userDataToCreate.status = 'active'; // Customers are automatically active
    }

    const user = await User.create(userDataToCreate);

    // Mark OTP as verified and delete
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name, role);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      restaurantName: user.restaurantName,
      ngoName: user.ngoName,
      token: generateToken(user._id),
      message: 'Registration successful!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token - Direct login (no OTP)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Direct login for all users — no OTP on login
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      restaurantName: user.restaurantName,
      ngoName: user.ngoName,
      token: generateToken(user._id),
      requiresOTP: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and complete login - Step 2
// @route   POST /api/auth/verify-login
// @access  Public
const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      purpose: 'login',
      verified: false 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or invalid. Please login again.' });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please login again.' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.` 
      });
    }

    // OTP is valid, delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Return user data and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      restaurantName: user.restaurantName,
      ngoName: user.ngoName,
      token: generateToken(user._id),
      message: 'Login successful!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!['registration', 'login'].includes(purpose)) {
      return res.status(400).json({ message: 'Invalid OTP purpose' });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Delete existing OTPs
    await OTP.deleteMany({ email, purpose });
    
    // Create new OTP
    await OTP.create({
      email,
      otp,
      purpose
    });

    // Send OTP email
    await sendOTPEmail(email, otp, purpose);
    
    res.json({ message: 'New OTP sent to your email address' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyRegistration,
  loginUser,
  verifyLogin,
  resendOTP,
  getUserProfile
};
