require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const Donation = require('../models/Donation');
const PreOrder = require('../models/PreOrder');
const Prediction = require('../models/Prediction');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Inventory.deleteMany({});
    await Donation.deleteMany({});
    await PreOrder.deleteMany({});
    await Prediction.deleteMany({});

    console.log('Creating users...');

    // Create Admin (single admin user)
    const admin = await User.create({
      name: 'Pranitha Admin',
      email: 'pranitha.admin@zerowaste.com',
      password: 'ZW@P2024Admin!',
      role: 'admin',
      phone: '+91 98765 00000',
      location: 'Mumbai, Maharashtra',
      status: 'active'
    });

    console.log('Admin created:', admin.email);

    // Create Sample Restaurants
    const restaurant1 = await User.create({
      name: 'Restaurant Owner',
      email: 'restaurant@zerowaste.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '+91 98765 11111',
      location: 'Mumbai, Maharashtra',
      restaurantName: 'Spice Garden',
      wasteReduction: 24,
      mealsDonated: 145,
      status: 'active'
    });

    const restaurant2 = await User.create({
      name: 'Green Kitchen Owner',
      email: 'greenleaf@zerowaste.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '+91 98765 22222',
      location: 'Bangalore, Karnataka',
      restaurantName: 'Green Leaf Kitchen',
      wasteReduction: 31,
      mealsDonated: 198,
      status: 'active'
    });

    const restaurant3 = await User.create({
      name: 'Taste Owner',
      email: 'tasteofindia@zerowaste.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '+91 98765 33333',
      location: 'Delhi, Delhi',
      restaurantName: 'Taste of India',
      wasteReduction: 18,
      mealsDonated: 89,
      status: 'active'
    });

    // Create Pending Restaurant
    await User.create({
      name: 'Fresh Bites Owner',
      email: 'freshbites@zerowaste.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '+91 98765 44444',
      location: 'Hyderabad, Telangana',
      restaurantName: 'Fresh Bites',
      wasteReduction: 0,
      mealsDonated: 0,
      status: 'pending'
    });

    console.log('Restaurants created');

    // Create Sample NGOs
    const ngo1 = await User.create({
      name: 'Hope Shelter Manager',
      email: 'hope@zerowaste.com',
      password: 'ngo123',
      role: 'ngo',
      phone: '+91 98765 43210',
      location: 'Mumbai, Maharashtra',
      ngoName: 'Hope Shelter',
      capacity: 50,
      distance: '3 km',
      status: 'active'
    });

    const ngo2 = await User.create({
      name: 'Care Home Manager',
      email: 'care@zerowaste.com',
      password: 'ngo123',
      role: 'ngo',
      phone: '+91 98765 43211',
      location: 'Mumbai, Maharashtra',
      ngoName: 'Care Old Age Home',
      capacity: 30,
      distance: '5 km',
      status: 'active'
    });

    const ngo3 = await User.create({
      name: 'Children Paradise Manager',
      email: 'children@zerowaste.com',
      password: 'ngo123',
      role: 'ngo',
      phone: '+91 98765 43212',
      location: 'Mumbai, Maharashtra',
      ngoName: "Children's Paradise",
      capacity: 80,
      distance: '7 km',
      status: 'active'
    });

    // Create Pending NGO
    await User.create({
      name: 'Unity Shelter Manager',
      email: 'unity@zerowaste.com',
      password: 'ngo123',
      role: 'ngo',
      phone: '+91 98765 43213',
      location: 'Chennai, Tamil Nadu',
      ngoName: 'Unity Shelter',
      capacity: 40,
      distance: '4 km',
      status: 'pending'
    });

    console.log('NGOs created');

    // Create Sample Customers
    const customer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91 98765 55555',
      location: 'Mumbai, Maharashtra',
      status: 'active'
    });

    const customer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91 98765 55556',
      location: 'Mumbai, Maharashtra',
      status: 'active'
    });

    console.log('Customers created');

    // Create Menu Items for Restaurant 1
    console.log('Creating menu items...');

    const menuItem1 = await MenuItem.create({
      name: 'Veg Thali',
      description: 'Traditional Indian platter with dal, sabzi, roti, rice, and dessert',
      price: 180,
      image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500',
      stock: 12,
      category: 'Main Course',
      restaurant: restaurant1._id,
      isAvailable: true
    });

    const menuItem2 = await MenuItem.create({
      name: 'Biryani',
      description: 'Aromatic basmati rice with vegetables and exotic spices',
      price: 220,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      stock: 8,
      category: 'Main Course',
      restaurant: restaurant1._id,
      isAvailable: true
    });

    await MenuItem.create({
      name: 'Paneer Butter Masala',
      description: 'Rich and creamy cottage cheese curry with butter naan',
      price: 240,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
      stock: 15,
      category: 'Main Course',
      restaurant: restaurant1._id,
      isAvailable: true
    });

    await MenuItem.create({
      name: 'Tomato Soup',
      description: 'Fresh tomato soup with herbs and cream',
      price: 80,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
      stock: 20,
      category: 'Starter',
      restaurant: restaurant1._id,
      isAvailable: true
    });

    await MenuItem.create({
      name: 'Rice Bowl',
      description: 'Healthy brown rice with seasonal vegetables and tofu',
      price: 160,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500',
      stock: 18,
      category: 'Main Course',
      restaurant: restaurant1._id,
      isAvailable: true
    });

    await MenuItem.create({
      name: 'Dal Makhani',
      description: 'Slow-cooked black lentils in rich tomato gravy',
      price: 140,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
      stock: 10,
      category: 'Main Course',
      restaurant: restaurant1._id,
      isAvailable: true
    });

    console.log('Menu items created');

    // Create Inventory for Restaurant 1
    console.log('Creating inventory...');

    await Inventory.create({
      restaurant: restaurant1._id,
      ingredient: 'Tomatoes',
      quantity: '15 kg',
      expiry: '5 days',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'Good'
    });

    await Inventory.create({
      restaurant: restaurant1._id,
      ingredient: 'Paneer',
      quantity: '8 kg',
      expiry: '2 days',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'Near Expiry'
    });

    await Inventory.create({
      restaurant: restaurant1._id,
      ingredient: 'Rice',
      quantity: '50 kg',
      expiry: '60 days',
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'Good'
    });

    await Inventory.create({
      restaurant: restaurant1._id,
      ingredient: 'Dal (Lentils)',
      quantity: '25 kg',
      expiry: '45 days',
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'Good'
    });

    await Inventory.create({
      restaurant: restaurant1._id,
      ingredient: 'Fresh Vegetables',
      quantity: '12 kg',
      expiry: '1 day',
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'Critical'
    });

    await Inventory.create({
      restaurant: restaurant1._id,
      ingredient: 'Milk',
      quantity: '10 liters',
      expiry: '2 days',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'Near Expiry'
    });

    console.log('Inventory created');

    // Create sample pre-orders
    console.log('Creating pre-orders...');

    await PreOrder.create({
      customer: customer1._id,
      customerName: customer1.name,
      restaurant: restaurant1._id,
      items: [{
        menuItem: menuItem1._id,
        dish: 'Veg Thali',
        quantity: 2,
        price: 180
      }],
      totalAmount: 360,
      pickupTime: '12:30 PM',
      status: 'Confirmed'
    });

    await PreOrder.create({
      customer: customer2._id,
      customerName: customer2.name,
      restaurant: restaurant1._id,
      items: [{
        menuItem: menuItem2._id,
        dish: 'Biryani',
        quantity: 1,
        price: 220
      }],
      totalAmount: 220,
      pickupTime: '1:00 PM',
      status: 'Preparing'
    });

    console.log('Pre-orders created');

    // Create sample donations
    console.log('Creating donations...');

    await Donation.create({
      restaurant: restaurant1._id,
      restaurantName: restaurant1.restaurantName,
      meals: 5,
      type: 'Veg Meals',
      expiry: '3 hours',
      expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: 'Available'
    });

    await Donation.create({
      restaurant: restaurant2._id,
      restaurantName: restaurant2.restaurantName,
      meals: 8,
      type: 'Rice Bowl',
      expiry: '4 hours',
      expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      status: 'Available'
    });

    // Create delivered donations (history)
    await Donation.create({
      restaurant: restaurant1._id,
      restaurantName: restaurant1.restaurantName,
      meals: 12,
      type: 'Mixed Meals',
      expiry: '3 hours',
      expiryTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'Delivered',
      ngo: ngo1._id,
      ngoName: ngo1.ngoName,
      acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    console.log('Donations created');

    // Create sample predictions for Restaurant 1
    console.log('Creating predictions...');

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const predictions = [
      { historical: 95, predicted: 92 },
      { historical: 110, predicted: 108 },
      { historical: 125, predicted: 122 },
      { historical: 118, predicted: 115 },
      { historical: 140, predicted: 145 },
      { historical: 160, predicted: 165 },
      { historical: 135, predicted: 130 }
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);

      await Prediction.create({
        restaurant: restaurant1._id,
        date: date,
        dayOfWeek: daysOfWeek[i],
        historical: predictions[i].historical,
        predicted: predictions[i].predicted,
        actual: predictions[i].historical,
        dishPredictions: [
          { dish: 'Veg Thali', recommended: 45, actual: 50 },
          { dish: 'Biryani', recommended: 30, actual: 28 },
          { dish: 'Paneer Masala', recommended: 35, actual: 38 },
          { dish: 'Rice Bowl', recommended: 25, actual: 22 },
          { dish: 'Dal Makhani', recommended: 20, actual: 20 }
        ]
      });
    }

    console.log('Predictions created');

    console.log('\n===========================================');
    console.log('Database seeded successfully!');
    console.log('===========================================');
    console.log('\nLogin Credentials:');
    console.log('\n--- ADMIN ---');
    console.log('Email: pranitha.admin@zerowaste.com');
    console.log('Password: ZW@P2024Admin!');
    console.log('\n--- RESTAURANT ---');
    console.log('Email: restaurant@zerowaste.com');
    console.log('Password: restaurant123');
    console.log('\n--- NGO ---');
    console.log('Email: hope@zerowaste.com');
    console.log('Password: ngo123');
    console.log('\n--- CUSTOMER ---');
    console.log('Email: rahul@example.com');
    console.log('Password: customer123');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
