require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@zerowaste.com' });
    
    if (adminExists) {
      console.log('Admin user already exists!');
      console.log('Email: admin@zerowaste.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@zerowaste.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 00000',
      location: 'Mumbai, Maharashtra',
      status: 'active'
    });

    console.log('\n===========================================');
    console.log('✅ Admin user created successfully!');
    console.log('===========================================');
    console.log('\n📧 Login Credentials:');
    console.log('Email: admin@zerowaste.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Note: Admin login does NOT require OTP verification');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
