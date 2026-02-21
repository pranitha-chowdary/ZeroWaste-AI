import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import {
  LayoutDashboard,
  ClipboardList,
  Brain,
  Package,
  Heart,
  BarChart3,
  TrendingDown,
  Users,
  CheckCircle,
  Award,
  Leaf,
  AlertTriangle,
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { menuAPI, orderAPI, inventoryAPI, donationAPI, predictionAPI } from '../services/api';

interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  isAvailable: boolean;
}

interface PreOrder {
  _id: string;
  customerName: string;
  items: Array<{
    dish: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  pickupTime: string;
  status: string;
  createdAt: string;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: string;
}

interface Donation {
  _id: string;
  meals: number;
  requestedMeals?: number;
  type: string;
  expiry: string;
  pickupTime: string;
  status: string;
  ngoName?: string;
  acceptedAt?: string;
}

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [optimization, setOptimization] = useState<any>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    image: '',
    stock: 0,
    category: '',
    isAvailable: true
  });
  const [inventoryFormData, setInventoryFormData] = useState({
    itemName: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    expiryDate: '',
    status: 'Good'
  });
  const [donationFormData, setDonationFormData] = useState({
    meals: 0,
    type: '',
    expiry: '',
    expiryTime: ''
  });

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', active: activeTab === 'overview', onClick: () => setActiveTab('overview') },
    { icon: UtensilsCrossed, label: 'Menu Management', active: activeTab === 'menu', onClick: () => setActiveTab('menu') },
    { icon: ClipboardList, label: 'Pre-Orders', active: activeTab === 'orders', onClick: () => setActiveTab('orders') },
    { icon: Brain, label: 'AI Predictions', active: activeTab === 'predictions', onClick: () => setActiveTab('predictions') },
    { icon: Package, label: 'Inventory', active: activeTab === 'inventory', onClick: () => setActiveTab('inventory') },
    { icon: Heart, label: 'Surplus', active: activeTab === 'surplus', onClick: () => setActiveTab('surplus') },
    { icon: BarChart3, label: 'Impact Analytics', active: activeTab === 'analytics', onClick: () => setActiveTab('analytics') }
  ];

  useEffect(() => {
    // Fetch overview data on mount
    fetchOrders();
    fetchInventory();
    fetchDonations();
    
    if (activeTab === 'menu') {
      fetchMenuItems();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'predictions') {
      fetchOptimization();
    } else if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'surplus') {
      fetchDonations();
    }
  }, [activeTab]);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      // Filter to show only current user's items
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getRestaurantOrders();
      setPreOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await donationAPI.getRestaurantDonations();
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    }
  };

  const fetchOptimization = async () => {
    try {
      // Try ML-powered optimization first
      try {
        const mlResponse = await predictionAPI.getMLOptimization();
        setOptimization(mlResponse.data);
        console.log('Using ML-powered optimization');
      } catch (mlError) {
        // Fallback to rule-based optimization if ML service unavailable
        console.log('ML service unavailable, using rule-based optimization');
        const response = await predictionAPI.getOptimization();
        setOptimization(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch optimization:', error);
    }
  };

  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem._id) {
        await menuAPI.update(editingItem._id, formData);
      } else {
        await menuAPI.create(formData);
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowMenuForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuAPI.delete(id);
        fetchMenuItems();
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        alert('Failed to delete menu item. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      stock: 0,
      category: '',
      isAvailable: true
    });
    setEditingItem(null);
    setShowMenuForm(false);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await donationAPI.create(donationFormData);
      fetchDonations();
      resetDonationForm();
      alert('Donation created successfully! NGOs will be notified.');
    } catch (error) {
      console.error('Failed to create donation:', error);
      alert('Failed to create donation. Please try again.');
    }
  };

  const resetDonationForm = () => {
    setDonationFormData({
      meals: 0,
      type: '',
      expiry: '',
      expiryTime: ''
    });
    setShowDonationForm(false);
  };

  const handleSubmitInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryAPI.create(inventoryFormData);
      fetchInventory();
      resetInventoryForm();
    } catch (error) {
      console.error('Error creating inventory item:', error);
    }
  };

  const resetInventoryForm = () => {
    setInventoryFormData({
      itemName: '',
      category: '',
      quantity: 0,
      unit: 'kg',
      expiryDate: '',
      status: 'Good'
    });
    setShowInventoryForm(false);
  };

  // Calculate real-time impact analytics from donations with safe defaults
  const totalMealsDonated = donations.reduce((sum, d) => sum + (d.meals || 0), 0);
  const acceptedDonations = donations.filter(d => d.status === 'Accepted' || d.status === 'Delivered');
  const mealsAccepted = acceptedDonations.reduce((sum, d) => sum + (d.requestedMeals || d.meals || 0), 0);
  const deliveredDonations = donations.filter(d => d.status === 'Delivered');
  const mealsDelivered = deliveredDonations.reduce((sum, d) => sum + (d.requestedMeals || d.meals || 0), 0);
  
  // Environmental impact calculations with safe defaults
  const avgKgPerMeal = 0.5; // Average 0.5kg of food per meal
  const foodWastePrevented = mealsAccepted * avgKgPerMeal || 0; // in kg
  const co2SavedPerKg = 2.5; // 2.5kg CO₂ per kg of food waste prevented
  const co2Saved = foodWastePrevented * co2SavedPerKg || 0; // in kg
  const avgCostPerMeal = 150; // Average ₹150 per meal
  const moneySaved = mealsAccepted * avgCostPerMeal || 0; // in rupees
  
  // Calculate waste distribution (removed = donations requested, active = pending)
  const pendingMeals = donations.filter(d => d.status === 'Pending').reduce((sum, d) => sum + d.meals, 0);
  const totalMeals = totalMealsDonated || 1; // Avoid division by zero
  
  const wasteData = [
    { 
      name: 'Donated & Accepted', 
      value: Math.round((mealsAccepted / totalMeals) * 100) || 0, 
      color: '#2D6A4F' 
    },
    { 
      name: 'Pending Donation', 
      value: Math.round((pendingMeals / totalMeals) * 100) || 0, 
      color: '#E85D04' 
    },
    { 
      name: 'Delivered', 
      value: Math.round((mealsDelivered / totalMeals) * 100) || 0, 
      color: '#FFF8E7' 
    }
  ];
  
  // Calculate sustainability score (0-100)
  const donationRate = totalMealsDonated > 0 ? (mealsAccepted / totalMealsDonated) * 100 : 0;
  const deliveryRate = mealsAccepted > 0 ? (mealsDelivered / mealsAccepted) * 100 : 0;
  const sustainabilityScore = Math.round((donationRate * 0.6) + (deliveryRate * 0.4));

  const notifyNGO = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div className="flex">
        <Sidebar items={sidebarItems} />

        <div className="flex-1 pt-20 px-8 pb-12">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Restaurant Dashboard</h1>
                <p className="text-gray-400">Monitor your kitchen's sustainability performance</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Pre-Orders"
                  value={preOrders.length}
                  icon={CheckCircle}
                  color="green"
                  subtitle="All orders"
                />
                <StatCard
                  title="Confirmed Orders"
                  value={preOrders.filter(o => o.status === 'Confirmed').length}
                  icon={Clock}
                  color="blue"
                  subtitle="Pending preparation"
                />
                <StatCard
                  title="Menu Items"
                  value={menuItems.length}
                  icon={UtensilsCrossed}
                  color="purple"
                  subtitle="items in menu"
                />
                <StatCard
                  title="Inventory Items"
                  value={inventory.length}
                  icon={Package}
                  color="orange"
                  subtitle="items in stock"
                />
                <StatCard
                  title="Donations Made"
                  value={donations.filter(d => d.status === 'Delivered').length}
                  icon={Heart}
                  color="green"
                  subtitle="completed donations"
                />
                <StatCard
                  title="Active Donations"
                  value={donations.filter(d => d.status === 'Available' || d.status === 'Accepted').length}
                  icon={Leaf}
                  color="green"
                  subtitle="pending donations"
                />
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mt-6">
                <h3 className="text-2xl font-bold text-white mb-4">Welcome to Your Dashboard</h3>
                <p className="text-gray-300">Monitor your restaurant's orders, menu, inventory, and sustainability impact in real-time.</p>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Menu Management</h1>
                  <p className="text-gray-400">Manage your restaurant menu items</p>
                </div>
                <button
                  onClick={() => setShowMenuForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Menu Item</span>
                </button>
              </div>

              {menuItems.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <UtensilsCrossed className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl mb-4">No menu items yet</p>
                  <button
                    onClick={() => setShowMenuForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Add Your First Menu Item
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map(item => (
                    <div
                      key={item._id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.isAvailable ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-2">
                          <span className="text-xs text-[#E85D04] font-semibold">{item.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-white">₹{item.price}</span>
                          <span className="text-gray-400 text-sm">Stock: {item.stock}</span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg font-semibold hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-1"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id!)}
                            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center space-x-1"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Pre-Orders</h1>
                <p className="text-gray-400">Manage confirmed orders</p>
              </div>

              {preOrders.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <ClipboardList className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No orders yet</p>
                  <p className="text-gray-500 text-sm mt-2">Orders from customers will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {preOrders.map(order => (
                    <div key={order._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{order.customerName}</h3>
                          <p className="text-gray-400 text-sm">Order ID: {order._id.slice(-8)}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          order.status === 'Completed' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                          order.status === 'Ready' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                          order.status === 'Preparing' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-gray-300">
                            <span>{item.dish} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/20">
                        <div className="text-gray-400">
                          <Clock size={16} className="inline mr-2" />
                          Pickup: {order.pickupTime}
                        </div>
                        <div className="text-xl font-bold text-white">
                          Total: ₹{order.totalAmount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">AI Production Optimization Engine</h1>
                <p className="text-gray-400">Your system doesn't just predict demand—it optimizes production</p>
              </div>

              {!optimization ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Brain className="mx-auto mb-4 text-gray-500 animate-pulse" size={64} />
                  <p className="text-gray-400 text-xl">Loading AI Optimization...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-4 gap-6">
                    <StatCard
                      title="System Status"
                      value={optimization.summary?.status || 'N/A'}
                      icon={optimization.summary?.status === 'Good' ? CheckCircle : AlertTriangle}
                      color={optimization.summary?.status === 'Good' ? 'green' : 'orange'}
                      subtitle="Overall health"
                    />
                    <StatCard
                      title="Optimization Score"
                      value={`${optimization.summary?.optimizationScore || 0}%`}
                      icon={Brain}
                      color="blue"
                      subtitle="Efficiency rating"
                    />
                    <StatCard
                      title="Critical Alerts"
                      value={optimization.summary?.criticalAlerts || 0}
                      icon={AlertTriangle}
                      color="red"
                      subtitle="Require attention"
                    />
                    <StatCard
                      title="Recommendations"
                      value={optimization.summary?.totalRecommendations || 0}
                      icon={Brain}
                      color="green"
                      subtitle="Smart insights"
                    />
                  </div>

                  {/* Waste Minimization Alerts */}
                  {optimization.wasteAlerts.length > 0 && (
                    <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-red-500" size={32} />
                        <h2 className="text-2xl font-bold text-white">Waste Minimization Alerts</h2>
                      </div>
                      <div className="space-y-3">
                        {optimization.wasteAlerts.map((alert: any, index: number) => (
                          <div 
                            key={index}
                            className={`p-4 rounded-xl ${
                              alert.severity === 'high' 
                                ? 'bg-red-500/20 border border-red-500/50' 
                                : 'bg-orange-500/20 border border-orange-500/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-1 bg-white/10 rounded text-xs font-semibold text-white">
                                    {alert.type}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                                  }`}>
                                    {alert.severity.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-white font-medium mb-1">{alert.message}</p>
                                <p className="text-gray-300 text-sm">Action: {alert.action}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Production Recommendations */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Brain className="text-blue-500" size={32} />
                      <div>
                        <h2 className="text-2xl font-bold text-white">AI Kitchen Planner</h2>
                        <p className="text-gray-400 text-sm">Smart production recommendations to reduce supply wastages</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {optimization.recommendations.slice(0, 10).map((rec: any, index: number) => (
                        <div 
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">{rec.dish}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  rec.priority === 'Urgent' ? 'bg-red-500 text-white' :
                                  rec.priority === 'High' ? 'bg-orange-500 text-white' :
                                  rec.priority === 'Medium' ? 'bg-yellow-500 text-black' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {rec.priority}
                                </span>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                  {rec.category}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <p className="text-gray-400 text-xs">Recommended</p>
                                  <p className="text-white font-bold text-lg">{rec.recommended} units</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Current Stock</p>
                                  <p className="text-white font-bold text-lg">{rec.currentStock}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Avg Daily Demand</p>
                                  <p className="text-white font-bold text-lg">{rec.avgDailyDemand}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Potential Profit</p>
                                  <p className="text-green-400 font-bold text-lg">{rec.potentialProfit}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Leaf className="text-green-500" size={16} />
                                <p className="text-gray-300">{rec.reason}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inventory Status */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Package className="text-purple-500" size={28} />
                        <h2 className="text-xl font-bold text-white">Inventory Analysis</h2>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                          <p className="text-green-400 text-sm mb-1">Good Stock</p>
                          <p className="text-white text-3xl font-bold">{optimization.inventoryAnalysis.good}</p>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                          <p className="text-yellow-400 text-sm mb-1">Near Expiry</p>
                          <p className="text-white text-3xl font-bold">{optimization.inventoryAnalysis.nearExpiry}</p>
                        </div>
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                          <p className="text-red-400 text-sm mb-1">Critical</p>
                          <p className="text-white text-3xl font-bold">{optimization.inventoryAnalysis.critical}</p>
                        </div>
                        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                          <p className="text-blue-400 text-sm mb-1">Total Items</p>
                          <p className="text-white text-3xl font-bold">{optimization.inventoryAnalysis.totalItems}</p>
                        </div>
                      </div>

                      {optimization.inventoryAnalysis.criticalItems.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm font-semibold mb-2">Critical Items:</p>
                          {optimization.inventoryAnalysis.criticalItems.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium">{item.ingredient}</span>
                                <span className="text-red-400 text-sm">{item.daysLeft}d left</span>
                              </div>
                              <p className="text-gray-400 text-xs mt-1">{item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Profit Insights */}
                    <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="text-green-500" size={28} />
                        <h2 className="text-xl font-bold text-white">Profit Maximization</h2>
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-400 text-sm mb-2">Total Potential Profit (Today)</p>
                        <p className="text-green-400 text-4xl font-bold">₹{optimization.profitInsights.totalPotentialProfit}</p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm font-semibold mb-3">Top Performers (This Week)</p>
                        <div className="space-y-3">
                          {optimization.profitInsights.topPerformers.map((item: any, index: number) => (
                            <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-white font-semibold">{item.name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-400 font-bold">{item.weeklyProfit}</span>
                                <span className="text-blue-400 text-xs">{item.demandTrend}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Donation Impact & Waste Reduction */}
                  <div className="bg-gradient-to-br from-orange-500/20 to-green-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Heart className="text-orange-500" size={32} />
                      <div>
                        <h2 className="text-2xl font-bold text-white">Real-time Donation Impact</h2>
                        <p className="text-gray-400 text-sm">How AI optimization drives food waste reduction</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="text-orange-400" size={20} />
                          <p className="text-gray-400 text-sm">Meals Accepted</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{mealsAccepted}</p>
                        <p className="text-gray-400 text-xs mt-1">by NGOs (of {totalMealsDonated} offered)</p>
                      </div>
                      
                      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="text-green-400" size={20} />
                          <p className="text-gray-400 text-sm">Food Waste Prevented</p>
                        </div>
                        <p className="text-green-400 text-3xl font-bold">{foodWastePrevented.toFixed(1)}</p>
                        <p className="text-gray-400 text-xs mt-1">kg of food saved</p>
                      </div>
                      
                      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="text-blue-400" size={20} />
                          <p className="text-gray-400 text-sm">CO₂ Emissions Saved</p>
                        </div>
                        <p className="text-blue-400 text-3xl font-bold">{co2Saved.toFixed(1)}</p>
                        <p className="text-gray-400 text-xs mt-1">kg CO₂ reduced</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-2">AI-Driven Waste Reduction</h3>
                          <p className="text-gray-300 text-sm mb-3">
                            Our AI optimization engine analyzes your inventory and production patterns to identify surplus food 
                            that can be donated. This smart approach has helped you donate <span className="text-orange-400 font-bold">{mealsAccepted} meals</span> (accepted by NGOs), 
                            preventing <span className="text-green-400 font-bold">{foodWastePrevented.toFixed(1)} kg</span> of food waste.
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            {mealsAccepted > 0 ? (
                              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg">
                                <CheckCircle className="text-green-400" size={16} />
                                <span className="text-green-400 font-semibold">
                                  {mealsAccepted} meals accepted by NGOs • {((mealsAccepted/totalMealsDonated)*100).toFixed(0)}% acceptance rate
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg">
                                <AlertTriangle className="text-yellow-400" size={16} />
                                <span className="text-yellow-400 font-semibold">
                                  Create donations from surplus to maximize impact
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {donations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm font-semibold mb-3">Recent Donation Activity</p>
                        <div className="space-y-2">
                          {donations.slice(0, 3).map((donation, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  donation.status === 'Delivered' ? 'bg-green-400' :
                                  donation.status === 'Accepted' ? 'bg-blue-400' :
                                  'bg-yellow-400'
                                }`} />
                                <div>
                                  <p className="text-white font-medium">{donation.meals} meals • {donation.type}</p>
                                  <p className="text-gray-400 text-xs">
                                    {donation.status === 'Accepted' || donation.status === 'Delivered' 
                                      ? `${donation.ngoName || 'NGO'} • ${donation.requestedMeals || donation.meals} meals`
                                      : 'Pending acceptance'}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                donation.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                donation.status === 'Accepted' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {donation.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Inventory Management</h1>
                  <p className="text-gray-400">Track ingredient stock levels and expiry dates</p>
                </div>
                <button
                  onClick={() => setShowInventoryForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus size={20} />
                  Add Inventory Item
                </button>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Package className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No inventory items yet</p>
                  <p className="text-gray-500 text-sm mt-2">Add items to track your inventory</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map(item => {
                    const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysUntilExpiry <= 3;
                    const isExpired = daysUntilExpiry < 0;
                    
                    return (
                      <div
                        key={item._id}
                        className={`bg-white/10 backdrop-blur-xl border rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${
                          isExpired ? 'border-red-500/50' : isExpiringSoon ? 'border-orange-500/50' : 'border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{item.itemName}</h3>
                            <p className="text-2xl font-bold text-[#E85D04]">{item.quantity} {item.unit}</p>
                          </div>
                          <Package className={`${
                            isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : 'text-green-500'
                          }`} size={24} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Category:</span>
                            <span className="text-white font-medium">{item.category}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Expiry Date:</span>
                            <span className={`font-medium ${
                              isExpired ? 'text-red-400' : isExpiringSoon ? 'text-orange-400' : 'text-white'
                            }`}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Days Left:</span>
                            <span className={`font-bold ${
                              isExpired ? 'text-red-400' : isExpiringSoon ? 'text-orange-400' : 'text-green-400'
                            }`}>
                              {isExpired ? 'EXPIRED' : `${daysUntilExpiry}d`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              item.status === 'Near Expiry' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'surplus' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Surplus Management</h1>
                  <p className="text-gray-400">Redistribute excess food to nearby NGOs</p>
                </div>
                <button
                  onClick={() => setShowDonationForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus size={20} />
                  Create Donation
                </button>
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Heart className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No donations yet</p>
                  <p className="text-gray-500 text-sm mt-2">Create a donation to help nearby NGOs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map(donation => (
                    <div key={donation._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold text-white">{donation.meals} Meals Available</h3>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              donation.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                              donation.status === 'Accepted' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-400 text-sm">Type</p>
                              <p className="text-white font-medium">{donation.type}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Expiry</p>
                              <p className="text-white font-medium">{donation.expiry}</p>
                            </div>
                          </div>

                          {donation.status === 'Accepted' && donation.ngoName && (
                            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="text-blue-400" size={20} />
                                <p className="text-blue-400 font-semibold">Accepted by NGO</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-gray-400 text-xs">NGO Name</p>
                                  <p className="text-white font-medium">{donation.ngoName}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Requested Meals</p>
                                  <p className="text-white font-medium">{donation.requestedMeals || donation.meals} meals</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Accepted At</p>
                                  <p className="text-white font-medium">
                                    {donation.acceptedAt ? new Date(donation.acceptedAt).toLocaleString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {donation.status === 'Delivered' && (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="text-green-400" size={20} />
                                <p className="text-green-400 font-semibold">Delivered Successfully</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Impact Analytics</h1>
                <p className="text-gray-400">Track your environmental and social impact from donations</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                  title="CO₂ Saved"
                  value={`${co2Saved.toFixed(1)} kg`}
                  icon={Leaf}
                  color="green"
                  subtitle={`From ${mealsAccepted} meals donated`}
                  animate={false}
                />
                <StatCard
                  title="Meals Accepted by NGOs"
                  value={mealsAccepted}
                  icon={Heart}
                  color="orange"
                  subtitle={`${totalMealsDonated} meals offered total`}
                />
                <StatCard
                  title="Food Waste Prevented"
                  value={`${foodWastePrevented.toFixed(1)} kg`}
                  icon={TrendingDown}
                  color="blue"
                  subtitle={`${mealsDelivered} meals delivered`}
                  animate={false}
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <ChartCard title="Donation Impact Distribution" subtitle="Real-time donation status">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={wasteData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {wasteData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #ffffff20', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Sustainability Score</h3>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="#ffffff20"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${sustainabilityScore * 5.026} ${100 * 5.026}`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E85D04" />
                            <stop offset="100%" stopColor="#2D6A4F" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white">{sustainabilityScore}</div>
                          <div className="text-gray-400 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Donation Acceptance</span>
                      <span className="text-white font-semibold">
                        {donationRate > 80 ? 'Excellent' : donationRate > 60 ? 'Very Good' : donationRate > 40 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Delivery Rate</span>
                      <span className="text-white font-semibold">
                        {deliveryRate > 80 ? 'Excellent' : deliveryRate > 60 ? 'Very Good' : deliveryRate > 40 ? 'Good' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Impact</span>
                      <span className="text-white font-semibold">{mealsDelivered} People Helped</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Real-time Donation Statistics */}
              <ChartCard title="Donation Summary" subtitle="Detailed breakdown of your donations">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-white mb-1">{totalMealsDonated}</div>
                    <div className="text-gray-400 text-sm">Total Meals Offered</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-green-400 mb-1">{mealsAccepted}</div>
                    <div className="text-gray-400 text-sm">Meals Accepted</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{mealsDelivered}</div>
                    <div className="text-gray-400 text-sm">Meals Delivered</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-orange-400 mb-1">{pendingMeals}</div>
                    <div className="text-gray-400 text-sm">Pending Donations</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-green-400" size={24} />
                    <div>
                      <div className="text-white font-semibold">Environmental Impact</div>
                      <div className="text-gray-300 text-sm">
                        You've prevented <span className="text-green-400 font-bold">{foodWastePrevented.toFixed(1)} kg</span> of food waste 
                        and saved <span className="text-blue-400 font-bold">{co2Saved.toFixed(1)} kg</span> of CO₂ emissions!
                      </div>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          )}
        </div>
      </div>

      {/* Menu Item Form Modal */}
      {showMenuForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#1F1F1F] border border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitMenu} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="e.g., Margherita Pizza"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="Describe your dish..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    placeholder="e.g., Main Course"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Availability</label>
                  <select
                    value={formData.isAvailable ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'true' })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDonationForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#1F1F1F] border border-white/20 rounded-2xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Donation</h2>
              <button
                onClick={resetDonationForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitDonation} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Number of Meals</label>
                <input
                  type="number"
                  value={donationFormData.meals}
                  onChange={(e) => setDonationFormData({ ...donationFormData, meals: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="e.g., 50"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Food Type</label>
                <input
                  type="text"
                  value={donationFormData.type}
                  onChange={(e) => setDonationFormData({ ...donationFormData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="e.g., Veg Thali, Biryani, Mixed Cuisine"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Expiry (Display Text)</label>
                <input
                  type="text"
                  value={donationFormData.expiry}
                  onChange={(e) => setDonationFormData({ ...donationFormData, expiry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="e.g., 2 hours, Today evening"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Expiry Date & Time</label>
                <input
                  type="datetime-local"
                  value={donationFormData.expiryTime}
                  onChange={(e) => setDonationFormData({ ...donationFormData, expiryTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  required
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> Once created, nearby NGOs and old age homes will be notified about this donation. They can accept full or partial meals based on their requirements.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetDonationForm}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Create Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Form Modal */}
      {showInventoryForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#1F1F1F] border border-white/20 rounded-2xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Inventory Item</h2>
              <button
                onClick={resetInventoryForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitInventory} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Item Name</label>
                <input
                  type="text"
                  value={inventoryFormData.itemName}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, itemName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  placeholder="e.g., Tomatoes, Rice, Chicken"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Category</label>
                  <select
                    value={inventoryFormData.category}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meat">Meat</option>
                    <option value="Spices">Spices</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Status</label>
                  <select
                    value={inventoryFormData.status}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    required
                  >
                    <option value="Good">Good</option>
                    <option value="Near Expiry">Near Expiry</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Quantity</label>
                  <input
                    type="number"
                    value={inventoryFormData.quantity}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    placeholder="e.g., 50"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Unit</label>
                  <select
                    value={inventoryFormData.unit}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={inventoryFormData.expiryDate}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  required
                />
              </div>

              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  <strong>AI Tip:</strong> Adding inventory with expiry dates helps our AI predict optimal production quantities and minimize waste!
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetInventoryForm}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
