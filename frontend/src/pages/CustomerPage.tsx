import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ShoppingCart, Clock, Check, Leaf, Store, ArrowLeft, MapPin } from 'lucide-react';
import { menuAPI, orderAPI } from '../services/api';

interface Restaurant {
  _id: string;
  restaurantName: string;
  location: string;
  email: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  restaurant: string;
  isAvailable: boolean;
}

export default function CustomerPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showTimeSlot, setShowTimeSlot] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const timeSlots = [
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await menuAPI.getActiveRestaurants();
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      setIsLoading(true);
      const response = await menuAPI.getByRestaurant(restaurantId);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    fetchMenuItems(restaurant._id);
    setCart({});
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
    setMenuItems([]);
    setCart({});
  };

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = menuItems.find(i => i._id === id);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  const handleCheckout = () => {
    if (getTotalItems() > 0) {
      setShowTimeSlot(true);
    }
  };

  const confirmOrder = async () => {
    if (selectedTime && selectedRestaurant) {
      try {
        // Prepare order items
        const orderItems = Object.entries(cart).map(([itemId, quantity]) => ({
          menuItemId: itemId,
          quantity
        }));

        // Create order via API
        await orderAPI.create({
          items: orderItems,
          pickupTime: selectedTime,
          restaurantId: selectedRestaurant._id
        });

        // Show confirmation
        setShowTimeSlot(false);
        setShowConfirmation(true);
        setTimeout(() => {
          setCart({});
          setSelectedTime('');
          setShowConfirmation(false);
        }, 4000);
      } catch (error: any) {
        console.error('Failed to create order:', error);
        alert(error.response?.data?.message || 'Failed to create order. Please try again.');
        setShowTimeSlot(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div
        className="relative min-h-screen pt-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F]/95 via-[#1F1F1F]/90 to-[#2D6A4F]/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {!selectedRestaurant ? (
            // Restaurants List View
            <>
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">Choose Your Restaurant</h1>
                <p className="text-gray-300 text-lg">Browse active restaurants and order sustainable meals</p>
              </div>

              {isLoading ? (
                <div className="text-center py-20">
                  <div className="text-white text-xl">Loading restaurants...</div>
                </div>
              ) : restaurants.length === 0 ? (
                <div className="text-center py-20">
                  <Store className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No active restaurants available at the moment</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {restaurants.map(restaurant => (
                    <div
                      key={restaurant._id}
                      onClick={() => handleRestaurantClick(restaurant)}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer group"
                    >
                      <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] rounded-full mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Store className="text-white" size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-white text-center mb-3">{restaurant.restaurantName}</h3>
                      <div className="flex items-center justify-center text-gray-300 mb-2">
                        <MapPin size={18} className="mr-2" />
                        <p className="text-sm">{restaurant.location || 'Location not specified'}</p>
                      </div>
                      <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                        View Menu
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Menu Items View
            <>
              <div className="mb-8">
                <button
                  onClick={handleBackToRestaurants}
                  className="flex items-center space-x-2 text-white hover:text-[#E85D04] transition-colors mb-6"
                >
                  <ArrowLeft size={24} />
                  <span className="font-semibold">Back to Restaurants</span>
                </button>
                <div className="text-center">
                  <h1 className="text-5xl font-bold text-white mb-2">{selectedRestaurant.restaurantName}</h1>
                  <p className="text-gray-300 text-lg">Pre-Order Your Meal</p>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-20">
                  <div className="text-white text-xl">Loading menu...</div>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-20">
                  <Leaf className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No menu items available yet</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                  {menuItems.filter(item => item.isAvailable).map(item => (
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
                            item.stock < 10
                              ? 'bg-red-500/90 text-white'
                              : 'bg-green-500/90 text-white'
                          }`}>
                            {item.stock < 10 ? `Only ${item.stock} left` : `${item.stock} available`}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-2">
                          <span className="text-xs text-[#E85D04] font-semibold">{item.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">₹{item.price}</span>
                          <button
                            onClick={() => addToCart(item._id)}
                            disabled={item.stock === 0}
                            className="px-6 py-2 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Pre-Order
                          </button>
                        </div>

                        {cart[item._id] && (
                          <div className="mt-3 text-center text-green-400 text-sm font-medium">
                            Added {cart[item._id]} to cart
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {getTotalItems() > 0 && !showConfirmation && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1F1F1F]/95 backdrop-blur-xl border-t border-white/20 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-white">
                  <ShoppingCart size={24} />
                  <span className="font-semibold">{getTotalItems()} items</span>
                </div>
                <div className="text-2xl font-bold text-white">₹{getTotalPrice()}</div>
              </div>
              <button
                onClick={handleCheckout}
                className="px-8 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {showTimeSlot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#1F1F1F] border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="text-[#E85D04]" size={28} />
              <h2 className="text-2xl font-bold text-white">Select Pickup Time</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedTime === time
                      ? 'bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white scale-105 shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowTimeSlot(false);
                  setSelectedTime('');
                }}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmOrder}
                disabled={!selectedTime}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-[#1F1F1F] to-[#2D6A4F]/30 border border-white/20 rounded-2xl p-10 max-w-md w-full shadow-2xl text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-500" size={40} />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Order Confirmed!</h2>
            <p className="text-gray-300 mb-6">
              Order #ZW{Math.floor(Math.random() * 10000)}
            </p>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Pickup Time:</span>
                <span className="text-white font-semibold">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-white font-semibold">₹{getTotalPrice()}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Leaf size={20} />
              <p className="text-sm font-medium">
                Thank you for supporting low-waste cooking!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
