const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// @desc    Get all active restaurants
// @route   GET /api/menu/restaurants
// @access  Public
const getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ 
      role: 'restaurant', 
      status: 'active' 
    })
      .select('restaurantName location email createdAt')
      .sort({ createdAt: -1 });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true })
      .populate('restaurant', 'restaurantName location')
      .sort({ createdAt: -1 });
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get menu items by restaurant
// @route   GET /api/menu/restaurant/:id
// @access  Public
const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.id })
      .sort({ createdAt: -1 });
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Restaurant
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, stock, category } = req.body;

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      image,
      stock,
      category,
      restaurant: req.user._id
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Restaurant
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if user owns this menu item
    if (menuItem.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Restaurant
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if user owns this menu item
    if (menuItem.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Menu item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveRestaurants,
  getMenuItems,
  getMenuItemsByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
