const express = require('express');
const router = express.Router();
const { getAllNGOs } = require('../controllers/ngoController');

// Public route
router.get('/', getAllNGOs);

module.exports = router;
