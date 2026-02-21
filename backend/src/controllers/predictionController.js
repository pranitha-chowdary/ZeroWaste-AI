const Prediction = require('../models/Prediction');

// @desc    Get demand predictions for restaurant
// @route   GET /api/predictions/demand
// @access  Private/Restaurant
const getDemandPredictions = async (req, res) => {
  try {
    // Get predictions for the current week
    const predictions = await Prediction.find({ 
      restaurant: req.user._id 
    })
      .sort({ date: -1 })
      .limit(7);

    // If no predictions exist, return mock data
    if (predictions.length === 0) {
      const mockPredictions = [
        { date: new Date(), dayOfWeek: "Mon", historical: 95, predicted: 92 },
        { date: new Date(), dayOfWeek: "Tue", historical: 110, predicted: 108 },
        { date: new Date(), dayOfWeek: "Wed", historical: 125, predicted: 122 },
        { date: new Date(), dayOfWeek: "Thu", historical: 118, predicted: 115 },
        { date: new Date(), dayOfWeek: "Fri", historical: 140, predicted: 145 },
        { date: new Date(), dayOfWeek: "Sat", historical: 160, predicted: 165 },
        { date: new Date(), dayOfWeek: "Sun", historical: 135, predicted: 130 }
      ];
      return res.json(mockPredictions);
    }

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get production recommendations
// @route   GET /api/predictions/production
// @access  Private/Restaurant
const getProductionRecommendations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prediction = await Prediction.findOne({
      restaurant: req.user._id,
      date: today
    });

    // If no prediction exists, return mock data
    if (!prediction || !prediction.dishPredictions) {
      const mockProduction = [
        { dish: "Veg Thali", recommended: 45, actual: 0 },
        { dish: "Biryani", recommended: 30, actual: 0 },
        { dish: "Paneer Masala", recommended: 35, actual: 0 },
        { dish: "Rice Bowl", recommended: 25, actual: 0 },
        { dish: "Dal Makhani", recommended: 20, actual: 0 }
      ];
      return res.json(mockProduction);
    }

    res.json(prediction.dishPredictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update prediction
// @route   POST /api/predictions
// @access  Private/Restaurant
const createPrediction = async (req, res) => {
  try {
    const { date, dayOfWeek, historical, predicted, dishPredictions } = req.body;

    const prediction = await Prediction.findOneAndUpdate(
      {
        restaurant: req.user._id,
        date: new Date(date)
      },
      {
        restaurant: req.user._id,
        date: new Date(date),
        dayOfWeek,
        historical,
        predicted,
        dishPredictions
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update actual production
// @route   PUT /api/predictions/:id/actual
// @access  Private/Restaurant
const updateActualProduction = async (req, res) => {
  try {
    const { actual, dishPredictions } = req.body;
    
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    // Check if user owns this prediction
    if (prediction.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    prediction.actual = actual;
    if (dishPredictions) {
      prediction.dishPredictions = dishPredictions;
    }

    await prediction.save();

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDemandPredictions,
  getProductionRecommendations,
  createPrediction,
  updateActualProduction
};
