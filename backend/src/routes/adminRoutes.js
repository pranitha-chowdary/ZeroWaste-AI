const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getAllNGOs,
  getPendingApprovals,
  updateApprovalStatus,
  getPlatformStats,
  getAllUsers
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect, admin);

router.get('/restaurants', getAllRestaurants);
router.get('/ngos', getAllNGOs);
router.get('/approvals', getPendingApprovals);
router.put('/approvals/:id', updateApprovalStatus);
router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);

module.exports = router;
