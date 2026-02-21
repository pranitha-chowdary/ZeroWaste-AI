import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { Heart, CheckCircle, Clock, Users, X } from 'lucide-react';
import { donationAPI } from '../services/api';

interface Donation {
  _id: string;
  meals: number;
  pickupTime: string;
  status: string;
  type: string;
  expiry: string;
  restaurant: {
    restaurantName: string;
    location: string;
  };
}

export default function NGODashboard() {
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [requestedMeals, setRequestedMeals] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        donationAPI.getAvailable(),
        donationAPI.getNGODonations()
      ]);
      setAvailableDonations(availableRes.data);
      setMyDonations(myRes.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    }
  };

  const openQuantityModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setRequestedMeals(donation.meals); // Default to full amount
    setShowQuantityModal(true);
  };

  const acceptDonation = async () => {
    if (!selectedDonation) return;
    
    try {
      await donationAPI.accept(selectedDonation._id, { requestedMeals });
      await fetchDonations(); // refresh both lists
      setShowQuantityModal(false);
      setShowAcceptModal(true);
      setTimeout(() => setShowAcceptModal(false), 3000);
    } catch (error) {
      console.error('Failed to accept donation:', error);
      alert('Failed to accept donation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div
        className="min-h-screen pt-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F]/95 via-[#2D6A4F]/40 to-[#1F1F1F]/95" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3">NGO Dashboard</h1>
            <p className="text-gray-300 text-lg">Manage food donations and community impact</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard
              title="Available Donations"
              value={availableDonations.length}
              icon={Heart}
              color="orange"
              subtitle="Ready to accept"
            />
            <StatCard
              title="Accepted"
              value={myDonations.filter(d => d.status === 'Accepted').length}
              icon={Clock}
              color="blue"
              subtitle="Pending pickup"
            />
            <StatCard
              title="Delivered"
              value={myDonations.filter(d => d.status === 'Delivered').length}
              icon={CheckCircle}
              color="green"
              subtitle="Completed"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Available Donations</h2>

              {availableDonations.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Heart className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No donations available at the moment</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later for food donations from restaurants</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {availableDonations.map(donation => (
                    <div
                      key={donation._id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{donation.meals} Meals</h3>
                          <p className="text-gray-400">
                            {donation.restaurant?.restaurantName || 'Restaurant'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {donation.restaurant?.location || ''}
                          </p>
                        </div>
                        <Heart className="text-[#E85D04]" size={32} />
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white font-medium">{donation.type || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Expiry:</span>
                          <span className="text-white font-medium">{donation.expiry || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            donation.status === 'Available' ? 'bg-green-500/20 text-green-400' :
                            donation.status === 'Accepted' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>

                      {donation.status === 'Available' && (
                        <button
                          onClick={() => openQuantityModal(donation)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          Accept Donation
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQuantityModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#1F1F1F] border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Accept Donation</h2>
              <button
                onClick={() => setShowQuantityModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">From Restaurant</p>
                <p className="text-white font-bold text-lg">{selectedDonation.restaurant?.restaurantName}</p>
                <p className="text-gray-500 text-sm">{selectedDonation.restaurant?.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Available Meals</p>
                  <p className="text-white font-bold text-2xl">{selectedDonation.meals}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Type</p>
                  <p className="text-white font-bold text-lg">{selectedDonation.type}</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">
                  How many meals do you need?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRequestedMeals(Math.max(1, requestedMeals - 10))}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => setRequestedMeals(Math.max(1, requestedMeals - 1))}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={requestedMeals}
                    onChange={(e) => setRequestedMeals(Math.min(selectedDonation.meals, Math.max(1, Number(e.target.value))))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                    min="1"
                    max={selectedDonation.meals}
                  />
                  <button
                    onClick={() => setRequestedMeals(Math.min(selectedDonation.meals, requestedMeals + 1))}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setRequestedMeals(Math.min(selectedDonation.meals, requestedMeals + 10))}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                  >
                    +10
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => setRequestedMeals(1)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Minimum
                  </button>
                  <button
                    onClick={() => setRequestedMeals(selectedDonation.meals)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Accept All ({selectedDonation.meals} meals)
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> The restaurant will be notified of your acceptance. Please ensure you can collect the meals within the expiry time: <strong>{selectedDonation.expiry}</strong>
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuantityModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={acceptDonation}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-[#1F1F1F] to-[#2D6A4F]/30 border border-white/20 rounded-2xl p-10 max-w-md w-full shadow-2xl text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Donation Accepted!</h2>
            <p className="text-gray-300 mb-4">
              The restaurant has been notified. Pickup details will be shared shortly.
            </p>

            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Heart size={20} />
              <p className="text-sm font-medium">
                Thank you for fighting food waste!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
