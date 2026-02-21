const express = require('express');
const router = express.Router();
const {
  getAvailableDonations,
  getRestaurantDonations,
  getNGODonations,
  createDonation,
  acceptDonation,
  markDelivered,
  getDonationHistory
} = require('../controllers/donationController');
const { protect, restaurant, ngo } = require('../middleware/auth');

// Protected routes
router.get('/', protect, ngo, getAvailableDonations);
router.get('/restaurant', protect, restaurant, getRestaurantDonations);
router.get('/ngo', protect, ngo, getNGODonations);
router.get('/history', protect, getDonationHistory);
router.post('/', protect, restaurant, createDonation);
router.put('/:id/accept', protect, ngo, acceptDonation);
router.put('/:id/deliver', protect, restaurant, markDelivered);

module.exports = router;
