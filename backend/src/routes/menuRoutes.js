const express = require('express');
const router = express.Router();
const {
  getActiveRestaurants,
  getMenuItems,
  getMenuItemsByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, restaurant } = require('../middleware/auth');

// Public routes
router.get('/restaurants', getActiveRestaurants);
router.get('/', getMenuItems);
router.get('/restaurant/:id', getMenuItemsByRestaurant);

// Protected routes (Restaurant only)
router.post('/', protect, restaurant, createMenuItem);
router.put('/:id', protect, restaurant, updateMenuItem);
router.delete('/:id', protect, restaurant, deleteMenuItem);

module.exports = router;
