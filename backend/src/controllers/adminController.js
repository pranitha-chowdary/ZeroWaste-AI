const User = require('../models/User');
const Donation = require('../models/Donation');
const PreOrder = require('../models/PreOrder');

// @desc    Get all restaurants
// @route   GET /api/admin/restaurants
// @access  Private/Admin
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: 'restaurant' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all NGOs
// @route   GET /api/admin/ngos
// @access  Private/Admin
const getAllNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending approvals
// @route   GET /api/admin/approvals
// @access  Private/Admin
const getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      status: 'pending',
      role: { $in: ['restaurant', 'ngo'] }
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject user
// @route   PUT /api/admin/approvals/:id
// @access  Private/Admin
const updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'rejected'
    
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.status = status;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
  try {
    // Count active restaurants
    const totalRestaurants = await User.countDocuments({ 
      role: 'restaurant', 
      status: 'active' 
    });

    // Count active NGOs
    const totalNGOs = await User.countDocuments({ 
      role: 'ngo', 
      status: 'active' 
    });

    // Total meals donated
    const donationStats = await Donation.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
    ]);
    const totalMealsDonated = donationStats.length > 0 ? donationStats[0].totalMeals : 0;

    // Calculate average waste reduction
    const restaurants = await User.find({ role: 'restaurant', status: 'active' });
    const avgWasteReduction = restaurants.length > 0
      ? restaurants.reduce((sum, r) => sum + (r.wasteReduction || 0), 0) / restaurants.length
      : 0;

    // Total orders
    const totalOrders = await PreOrder.countDocuments();

    // CO2 saved calculation (approximate)
    const co2Saved = (totalMealsDonated * 2.5 / 1000).toFixed(1); // 2.5 kg CO2 per meal

    // Waste reduction by restaurant (top 10)
    const wasteReductionByRestaurant = await User.find({ 
      role: 'restaurant', 
      status: 'active' 
    })
      .select('restaurantName wasteReduction')
      .sort({ wasteReduction: -1 })
      .limit(10)
      .then(restaurants => 
        restaurants.map(r => ({
          name: r.restaurantName,
          reduction: r.wasteReduction
        }))
      );

    res.json({
      totalRestaurants,
      totalNGOs,
      totalMealsDonated,
      avgWasteReduction: Math.round(avgWasteReduction),
      totalOrders,
      co2Saved: `${co2Saved}T`,
      wasteReductionByRestaurant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRestaurants,
  getAllNGOs,
  getPendingApprovals,
  updateApprovalStatus,
  getPlatformStats,
  getAllUsers
};
