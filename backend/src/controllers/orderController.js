const PreOrder = require('../models/PreOrder');
const MenuItem = require('../models/MenuItem');

// @desc    Create a new pre-order
// @route   POST /api/orders
// @access  Private/Customer
const createPreOrder = async (req, res) => {
  try {
    const { items, pickupTime, restaurantId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Calculate total amount and prepare items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      if (menuItem.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${menuItem.name}. Available: ${menuItem.stock}` 
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        dish: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });

      // Update menu item stock
      menuItem.stock -= item.quantity;
      await menuItem.save();
    }

    const preOrder = await PreOrder.create({
      customer: req.user._id,
      customerName: req.user.name,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      pickupTime
    });

    const populatedOrder = await PreOrder.findById(preOrder._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'restaurantName location')
      .populate('items.menuItem');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for a restaurant
// @route   GET /api/orders/restaurant
// @access  Private/Restaurant
const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await PreOrder.find({ restaurant: req.user._id })
      .populate('customer', 'name email phone')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for a customer
// @route   GET /api/orders/customer
// @access  Private/Customer
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await PreOrder.find({ customer: req.user._id })
      .populate('restaurant', 'restaurantName location')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Restaurant
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await PreOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this restaurant
    if (order.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await PreOrder.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.menuItem');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await PreOrder.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'restaurantName location')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPreOrder,
  getRestaurantOrders,
  getCustomerOrders,
  updateOrderStatus,
  getOrderById
};
