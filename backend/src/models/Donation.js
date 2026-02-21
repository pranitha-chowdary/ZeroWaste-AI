const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  meals: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true
  },
  expiry: {
    type: String,
    required: true
  },
  expiryTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Accepted', 'Delivered'],
    default: 'Available'
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ngoName: {
    type: String
  },
  acceptedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
