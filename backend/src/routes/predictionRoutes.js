const express = require('express');
const router = express.Router();
const {
  getDemandPredictions,
  getProductionRecommendations,
  createPrediction,
  updateActualProduction,
  getProductionOptimization
} = require('../controllers/predictionController');
const { protect, restaurant } = require('../middleware/auth');

// All routes require authentication and restaurant role
router.use(protect, restaurant);

router.get('/demand', getDemandPredictions);
router.get('/production', getProductionRecommendations);
router.get('/optimize', getProductionOptimization);
router.post('/', createPrediction);
router.put('/:id/actual', updateActualProduction);

module.exports = router;
