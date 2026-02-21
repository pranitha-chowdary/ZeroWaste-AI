const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true
  },
  historical: {
    type: Number,
    required: true
  },
  predicted: {
    type: Number,
    required: true
  },
  actual: {
    type: Number,
    default: 0
  },
  dishPredictions: [{
    dish: String,
    recommended: Number,
    actual: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Prediction', predictionSchema);
