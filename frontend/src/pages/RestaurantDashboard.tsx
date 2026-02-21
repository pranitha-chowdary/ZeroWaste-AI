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
  Clock
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
  pickupTime: string;
  status: string;
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
      const response = await predictionAPI.getOptimization();
      setOptimization(response.data);
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

  const wasteData = [
    { name: 'Reduced', value: 65, color: '#2D6A4F' },
    { name: 'Donated', value: 20, color: '#E85D04' },
    { name: 'Consumed', value: 15, color: '#FFF8E7' }
  ];

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
                      value={optimization.summary.status}
                      icon={optimization.summary.status === 'Good' ? CheckCircle : AlertTriangle}
                      color={optimization.summary.status === 'Good' ? 'green' : 'orange'}
                      subtitle="Overall health"
                    />
                    <StatCard
                      title="Optimization Score"
                      value={`${optimization.summary.optimizationScore}%`}
                      icon={Brain}
                      color="blue"
                      subtitle="Efficiency rating"
                    />
                    <StatCard
                      title="Critical Alerts"
                      value={optimization.summary.criticalAlerts}
                      icon={AlertTriangle}
                      color="red"
                      subtitle="Require attention"
                    />
                    <StatCard
                      title="Recommendations"
                      value={optimization.summary.totalRecommendations}
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
                        <p className="text-green-400 text-4xl font-bold">${optimization.profitInsights.totalPotentialProfit}</p>
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
                </>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Inventory Management</h1>
                <p className="text-gray-400">Track ingredient stock levels</p>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Package className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No inventory items yet</p>
                  <p className="text-gray-500 text-sm mt-2">Add items to track your inventory</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {inventory.map(item => (
                    <div
                      key={item._id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{item.itemName}</h3>
                          <p className="text-2xl font-bold text-[#E85D04]">{item.quantity} {item.unit}</p>
                        </div>
                        <Package className="text-green-500" size={24} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-white font-medium">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'surplus' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Surplus Management</h1>
                <p className="text-gray-400">Redistribute excess food to nearby NGOs</p>
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
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{donation.meals} Meals</h3>
                          <p className="text-gray-400">Pickup: {donation.pickupTime}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          donation.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                          donation.status === 'Accepted' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {donation.status}
                        </span>
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
                <p className="text-gray-400">Track your environmental and social impact</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                  title="CO₂ Saved"
                  value="37 kg"
                  icon={Leaf}
                  color="green"
                  subtitle="This month"
                  animate={false}
                />
                <StatCard
                  title="Meals Donated"
                  value={15}
                  icon={Heart}
                  color="orange"
                  subtitle="To local NGOs"
                />
                <StatCard
                  title="Money Saved"
                  value="₹8,500"
                  icon={TrendingDown}
                  color="blue"
                  subtitle="Through waste reduction"
                  animate={false}
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <ChartCard title="Waste Distribution" subtitle="How we're making an impact">
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
                          strokeDasharray={`${91 * 5.026} ${100 * 5.026}`}
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
                          <div className="text-5xl font-bold text-white">91</div>
                          <div className="text-gray-400 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Waste Reduction</span>
                      <span className="text-white font-semibold">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Pre-Order Accuracy</span>
                      <span className="text-white font-semibold">Very Good</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Donation Rate</span>
                      <span className="text-white font-semibold">Good</span>
                    </div>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
