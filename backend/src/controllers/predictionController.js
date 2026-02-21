const Prediction = require('../models/Prediction');
const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');
const PreOrder = require('../models/PreOrder');

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

// @desc    AI Production Optimization Engine
// @route   GET /api/predictions/optimize
// @access  Private/Restaurant
const getProductionOptimization = async (req, res) => {
  try {
    const restaurantId = req.user._id;

    // Fetch all required data in parallel
    const [inventory, menuItems, recentOrders] = await Promise.all([
      Inventory.find({ restaurant: restaurantId }),
      MenuItem.find({ restaurant: restaurantId }),
      PreOrder.find({ 
        restaurant: restaurantId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
    ]);

    // 1. INVENTORY ANALYSIS
    const inventoryAnalysis = {
      totalItems: inventory.length,
      critical: inventory.filter(item => item.status === 'Critical').length,
      nearExpiry: inventory.filter(item => item.status === 'Near Expiry').length,
      good: inventory.filter(item => item.status === 'Good').length,
      criticalItems: inventory
        .filter(item => item.status === 'Critical')
        .map(item => ({
          ingredient: item.ingredient,
          quantity: item.quantity,
          expiry: item.expiry,
          daysLeft: Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
        }))
    };

    // 2. MENU OPTIMIZATION
    const menuAnalysis = menuItems.map(item => {
      // Calculate demand from recent orders
      const ordersForItem = recentOrders.filter(order => 
        order.items.some(orderItem => orderItem.menuItemId?.toString() === item._id.toString())
      );
      
      const totalOrdered = ordersForItem.reduce((sum, order) => {
        const orderItem = order.items.find(i => i.menuItemId?.toString() === item._id.toString());
        return sum + (orderItem?.quantity || 0);
      }, 0);

      const avgDailyDemand = totalOrdered / 7;
      const profitMargin = item.price * 0.4; // Assuming 40% profit margin

      return {
        name: item.name,
        currentStock: item.stock,
        weeklyDemand: totalOrdered,
        avgDailyDemand: Math.ceil(avgDailyDemand),
        price: item.price,
        profitMargin: profitMargin.toFixed(2),
        category: item.category,
        isAvailable: item.isAvailable
      };
    });

    // 3. PRODUCTION RECOMMENDATIONS
    const recommendations = menuItems.map(item => {
      const analysis = menuAnalysis.find(a => a.name === item.name);
      const avgDailyDemand = analysis.avgDailyDemand;
      
      // AI Logic: Recommend production based on demand pattern
      let recommendedProduction = 0;
      let priority = 'Low';
      let reason = '';

      if (avgDailyDemand === 0) {
        recommendedProduction = 0;
        priority = 'Low';
        reason = 'No recent demand';
      } else if (avgDailyDemand < 3) {
        recommendedProduction = Math.ceil(avgDailyDemand * 1.2); // 20% buffer
        priority = 'Low';
        reason = 'Low demand - minimal production';
      } else if (avgDailyDemand < 10) {
        recommendedProduction = Math.ceil(avgDailyDemand * 1.3); // 30% buffer
        priority = 'Medium';
        reason = 'Moderate demand';
      } else {
        recommendedProduction = Math.ceil(avgDailyDemand * 1.5); // 50% buffer for high demand
        priority = 'High';
        reason = 'High demand - maximize profit';
      }

      // Check if ingredients are near expiry
      const usesExpiringIngredients = inventory.some(inv => 
        inv.status === 'Near Expiry' || inv.status === 'Critical'
      );

      if (usesExpiringIngredients && avgDailyDemand > 0) {
        priority = 'Urgent';
        reason = 'Use expiring ingredients - minimize waste';
      }

      // Calculate potential profit
      const potentialProfit = (recommendedProduction * item.price * 0.4).toFixed(2);

      return {
        dish: item.name,
        recommended: recommendedProduction,
        priority,
        reason,
        currentStock: item.stock,
        avgDailyDemand,
        potentialProfit: `$${potentialProfit}`,
        category: item.category
      };
    }).sort((a, b) => {
      // Sort by priority: Urgent > High > Medium > Low
      const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 4. WASTE MINIMIZATION ALERTS
    const wasteAlerts = [];
    
    // Alert for critical expiring items
    inventoryAnalysis.criticalItems.forEach(item => {
      wasteAlerts.push({
        type: 'Critical Expiry',
        message: `${item.ingredient} expires in ${item.daysLeft} day(s)`,
        action: 'Use immediately or donate',
        severity: 'high'
      });
    });

    // Alert for overstocked items with low demand
    menuAnalysis.forEach(item => {
      if (item.currentStock > item.avgDailyDemand * 3 && item.avgDailyDemand > 0) {
        wasteAlerts.push({
          type: 'Overstock',
          message: `${item.name} has ${item.currentStock} units but only ${item.avgDailyDemand} avg daily demand`,
          action: 'Reduce production or run promotion',
          severity: 'medium'
        });
      }
    });

    // 5. PROFIT MAXIMIZATION INSIGHTS
    const profitInsights = {
      topPerformers: menuAnalysis
        .filter(item => item.weeklyDemand > 0)
        .sort((a, b) => (b.profitMargin * b.weeklyDemand) - (a.profitMargin * a.weeklyDemand))
        .slice(0, 3)
        .map(item => ({
          name: item.name,
          weeklyProfit: `$${(item.profitMargin * item.weeklyDemand).toFixed(2)}`,
          demandTrend: 'Increasing'
        })),
      
      totalPotentialProfit: recommendations
        .reduce((sum, rec) => sum + parseFloat(rec.potentialProfit.replace('$', '')), 0)
        .toFixed(2)
    };

    // 6. OVERALL SUMMARY
    const summary = {
      status: wasteAlerts.filter(a => a.severity === 'high').length > 0 ? 'Action Required' : 'Good',
      totalRecommendations: recommendations.length,
      criticalAlerts: wasteAlerts.filter(a => a.severity === 'high').length,
      optimizationScore: Math.round(
        ((inventoryAnalysis.good / Math.max(inventoryAnalysis.totalItems, 1)) * 50) +
        ((menuAnalysis.filter(m => m.isAvailable).length / Math.max(menuAnalysis.length, 1)) * 50)
      )
    };

    res.json({
      summary,
      inventoryAnalysis,
      recommendations,
      wasteAlerts,
      profitInsights,
      menuAnalysis
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ML-based production optimization with demand forecasting
// @route   GET /api/predictions/ml-optimize
// @access  Private/Restaurant
const getMLOptimization = async (req, res) => {
  try {
    const restaurantId = req.user._id;

    // Fetch all required data in parallel
    const [inventory, menuItems, recentOrders] = await Promise.all([
      Inventory.find({ restaurant: restaurantId }),
      MenuItem.find({ restaurant: restaurantId }),
      PreOrder.find({ 
        restaurant: restaurantId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
    ]);

    // Prepare historical sales data for ML service
    const historicalData = [];
    
    // Process orders to extract sales data
    recentOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      order.items.forEach(item => {
        if (item.menuItemId) {
          const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId.toString());
          if (menuItem) {
            historicalData.push({
              date: orderDate.toISOString().split('T')[0],
              dish_name: menuItem.name,
              quantity_sold: item.quantity || 1,
              selling_price: menuItem.price,
              cost_price: menuItem.price * 0.6  // Assume 40% margin
            });
          }
        } else if (item.dish) {
          // Legacy format
          const menuItem = menuItems.find(m => m.name === item.dish);
          if (menuItem) {
            historicalData.push({
              date: orderDate.toISOString().split('T')[0],
              dish_name: item.dish,
              quantity_sold: item.quantity || 1,
              selling_price: menuItem.price,
              cost_price: menuItem.price * 0.6
            });
          }
        }
      });
    });

    // Prepare menu items data
    const menuItemsData = menuItems.map(item => ({
      name: item.name,
      price: item.price,
      stock: item.stock || 0,
      category: item.category,
      isAvailable: item.isAvailable
    }));

    // Prepare inventory data
    const inventoryData = inventory.map(item => ({
      ingredient: item.ingredient || item.itemName,
      itemName: item.itemName || item.ingredient,
      quantity: item.quantity,
      status: item.status,
      expiryDate: item.expiryDate
    }));

    // Call ML service
    const axios = require('axios');
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
        historical_data: historicalData,
        menu_items: menuItemsData,
        inventory_data: inventoryData
      }, {
        timeout: 10000  // 10 second timeout
      });

      if (mlResponse.data.success) {
        const productionPlan = mlResponse.data.production_plan;

        // Format response to match frontend expectations
        const response = {
          summary: {
            status: productionPlan.summary.high_waste_risk_count > 0 ? 'Caution' : 'Good',
            optimizationScore: Math.round(100 - (productionPlan.summary.high_waste_risk_count / productionPlan.summary.total_dishes * 50)),
            criticalAlerts: productionPlan.summary.high_waste_risk_count,
            totalRecommendations: productionPlan.predictions.length
          },
          inventoryAnalysis: {
            totalItems: inventory.length,
            critical: inventory.filter(item => item.status === 'Critical').length,
            nearExpiry: inventory.filter(item => item.status === 'Near Expiry').length,
            good: inventory.filter(item => item.status === 'Good').length,
            criticalItems: inventory
              .filter(item => item.status === 'Critical')
              .map(item => ({
                ingredient: item.ingredient || item.itemName,
                quantity: item.quantity,
                expiry: item.expiry || new Date(item.expiryDate).toLocaleDateString(),
                daysLeft: Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
              }))
          },
          recommendations: productionPlan.predictions.map(pred => ({
            dish: pred.dish_name,
            recommended: pred.recommended_production,
            currentStock: pred.current_stock,
            avgDailyDemand: Math.round(pred.predicted_demand),
            potentialProfit: `₹${pred.expected_profit.toFixed(2)}`,
            priority: pred.priority,
            reason: pred.action,
            category: menuItems.find(m => m.name === pred.dish_name)?.category || 'Other'
          })),
          wasteAlerts: productionPlan.waste_alerts.map(alert => ({
            type: 'overstocking',
            severity: alert.severity,
            message: alert.message,
            action: alert.action
          })),
          profitInsights: {
            totalPotentialProfit: productionPlan.summary.expected_profit.toFixed(2),
            topPerformers: productionPlan.predictions
              .sort((a, b) => b.expected_profit - a.expected_profit)
              .slice(0, 5)
              .map((item, index) => ({
                name: item.dish_name,
                weeklyProfit: `₹${item.expected_profit.toFixed(2)}`,
                demandTrend: item.predicted_demand > item.current_stock ? 'rising' : 'stable'
              }))
          },
          menuAnalysis: {
            topPerformers: productionPlan.predictions
              .filter(p => p.predicted_demand > 10)
              .map(p => p.dish_name),
            lowDemand: productionPlan.predictions
              .filter(p => p.predicted_demand < 5)
              .map(p => p.dish_name)
          },
          donationSuggestions: productionPlan.donation_suggestions,
          mlPowered: true,
          lastUpdated: new Date().toISOString()
        };

        return res.json(response);
      } else {
        throw new Error('ML service returned unsuccessful response');
      }

    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      
      // Fallback to rule-based optimization if ML service fails
      // (Use the existing getProductionOptimization logic)
      return getProductionOptimization(req, res);
    }

  } catch (error) {
    console.error('Optimization Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDemandPredictions,
  getProductionRecommendations,
  createPrediction,
  updateActualProduction,
  getProductionOptimization,
  getMLOptimization
};
