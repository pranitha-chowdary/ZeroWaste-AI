import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { Heart, CheckCircle, Clock, Users } from 'lucide-react';
import { donationAPI } from '../services/api';

interface Donation {
  _id: string;
  meals: number;
  pickupTime: string;
  status: string;
  restaurant: {
    restaurantName: string;
    location: string;
  };
}

export default function NGODashboard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationAPI.getAvailable();
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    }
  };

  const acceptDonation = async (id: string) => {
    try {
      await donationAPI.accept(id);
      fetchDonations();
      setShowAcceptModal(true);
      setTimeout(() => setShowAcceptModal(false), 3000);
    } catch (error) {
      console.error('Failed to accept donation:', error);
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
              value={donations.filter(d => d.status === 'Available').length}
              icon={Heart}
              color="orange"
              subtitle="Ready to accept"
            />
            <StatCard
              title="Accepted"
              value={donations.filter(d => d.status === 'Accepted').length}
              icon={Clock}
              color="blue"
              subtitle="Pending pickup"
            />
            <StatCard
              title="Delivered"
              value={donations.filter(d => d.status === 'Delivered').length}
              icon={CheckCircle}
              color="green"
              subtitle="Completed"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Available Donations</h2>

              {donations.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Heart className="mx-auto mb-4 text-gray-500" size={64} />
                  <p className="text-gray-400 text-xl">No donations available at the moment</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later for food donations from restaurants</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {donations.map(donation => (
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
                          <span className="text-gray-400">Pickup Time:</span>
                          <span className="text-white font-medium">{donation.pickupTime}</span>
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
                          onClick={() => acceptDonation(donation._id)}
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
