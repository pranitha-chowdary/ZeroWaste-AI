const User = require('../models/User');

// @desc    Get all NGOs
// @route   GET /api/ngos
// @access  Public
const getAllNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', status: 'active' })
      .select('ngoName location phone capacity distance')
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNGOs
};
