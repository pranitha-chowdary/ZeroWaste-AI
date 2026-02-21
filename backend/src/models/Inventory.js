const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'L', 'ml', 'units', 'packets'],
    default: 'kg'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Good', 'Near Expiry', 'Critical'],
    default: 'Good'
  },
  // Legacy fields for backward compatibility
  ingredient: {
    type: String,
    trim: true
  },
  expiry: {
    type: String
  }
}, {
  timestamps: true
});

// Update status based on expiry date before saving
inventorySchema.pre('save', function(next) {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 1) {
    this.status = 'Critical';
  } else if (daysUntilExpiry <= 3) {
    this.status = 'Near Expiry';
  } else {
    this.status = 'Good';
  }
  
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
