const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get all available donations
// @route   GET /api/donations
// @access  Private/NGO
const getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'Available' })
      .populate('restaurant', 'restaurantName location phone')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donations by restaurant
// @route   GET /api/donations/restaurant
// @access  Private/Restaurant
const getRestaurantDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ restaurant: req.user._id })
      .populate('ngo', 'ngoName location phone')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donations by NGO
// @route   GET /api/donations/ngo
// @access  Private/NGO
const getNGODonations = async (req, res) => {
  try {
    const donations = await Donation.find({ ngo: req.user._id })
      .populate('restaurant', 'restaurantName location phone')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a donation
// @route   POST /api/donations
// @access  Private/Restaurant
const createDonation = async (req, res) => {
  try {
    const { meals, type, expiry, expiryTime } = req.body;

    const donation = await Donation.create({
      restaurant: req.user._id,
      restaurantName: req.user.restaurantName,
      meals,
      type,
      expiry,
      expiryTime: new Date(expiryTime)
    });

    // Update restaurant's mealsDonated count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { mealsDonated: meals }
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a donation
// @route   PUT /api/donations/:id/accept
// @access  Private/NGO
const acceptDonation = async (req, res) => {
  try {
    const { requestedMeals } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'Available') {
      return res.status(400).json({ message: 'Donation is not available' });
    }

    // Validate requested meals
    const mealsToAccept = requestedMeals || donation.meals;
    if (mealsToAccept > donation.meals) {
      return res.status(400).json({ message: 'Requested meals exceed available amount' });
    }

    donation.status = 'Accepted';
    donation.ngo = req.user._id;
    donation.ngoName = req.user.ngoName;
    donation.requestedMeals = mealsToAccept;
    donation.acceptedAt = new Date();

    await donation.save();

    const updatedDonation = await Donation.findById(donation._id)
      .populate('restaurant', 'restaurantName location phone')
      .populate('ngo', 'ngoName location phone');

    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark donation as delivered
// @route   PUT /api/donations/:id/deliver
// @access  Private/Restaurant
const markDelivered = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation
    if (donation.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (donation.status !== 'Accepted') {
      return res.status(400).json({ message: 'Donation must be accepted first' });
    }

    donation.status = 'Delivered';
    donation.deliveredAt = new Date();

    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donation history
// @route   GET /api/donations/history
// @access  Private
const getDonationHistory = async (req, res) => {
  try {
    let query = { status: 'Delivered' };

    // Filter by role
    if (req.user.role === 'restaurant') {
      query.restaurant = req.user._id;
    } else if (req.user.role === 'ngo') {
      query.ngo = req.user._id;
    }

    const donations = await Donation.find(query)
      .populate('restaurant', 'restaurantName location')
      .populate('ngo', 'ngoName location')
      .sort({ deliveredAt: -1 })
      .limit(50);

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableDonations,
  getRestaurantDonations,
  getNGODonations,
  createDonation,
  acceptDonation,
  markDelivered,
  getDonationHistory
};
