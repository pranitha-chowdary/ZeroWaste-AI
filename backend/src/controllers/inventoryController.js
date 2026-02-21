const Inventory = require('../models/Inventory');

// @desc    Get inventory for a restaurant
// @route   GET /api/inventory
// @access  Private/Restaurant
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ restaurant: req.user._id })
      .sort({ expiryDate: 1 });

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private/Restaurant
const addInventoryItem = async (req, res) => {
  try {
    const { itemName, category, quantity, unit, expiryDate, status, ingredient, expiry } = req.body;

    const inventoryItem = await Inventory.create({
      restaurant: req.user._id,
      itemName: itemName || ingredient,
      category: category || 'Other',
      quantity,
      unit: unit || 'kg',
      expiryDate: new Date(expiryDate),
      status: status || 'Good',
      // Legacy fields
      ingredient: ingredient || itemName,
      expiry: expiry || new Date(expiryDate).toLocaleDateString()
    });

    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Restaurant
const updateInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if user owns this inventory
    if (inventoryItem.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Restaurant
const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if user owns this inventory
    if (inventoryItem.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.json({ message: 'Inventory item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};
