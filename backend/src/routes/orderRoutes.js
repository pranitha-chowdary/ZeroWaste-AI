const express = require('express');
const router = express.Router();
const {
  createPreOrder,
  getRestaurantOrders,
  getCustomerOrders,
  updateOrderStatus,
  getOrderById
} = require('../controllers/orderController');
const { protect, restaurant } = require('../middleware/auth');

// Protected routes
router.post('/', protect, createPreOrder);
router.get('/restaurant', protect, restaurant, getRestaurantOrders);
router.get('/customer', protect, getCustomerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, restaurant, updateOrderStatus);

module.exports = router;
