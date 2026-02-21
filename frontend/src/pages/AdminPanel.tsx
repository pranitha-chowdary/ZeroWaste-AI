import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { Store, Users, Leaf, TrendingDown, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';

export default function AdminPanel() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [wasteReductionData, setWasteReductionData] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [approvalsRes, restaurantsRes, statsRes] = await Promise.all([
        adminAPI.getApprovals(),
        adminAPI.getRestaurants(),
        adminAPI.getStats().catch(() => ({ data: {} })) // Stats endpoint might not exist yet
      ]);

      // Format approvals data
      const formattedApprovals = approvalsRes.data.map((user: any) => ({
        id: user._id,
        name: user.restaurantName || user.ngoName || user.name,
        type: user.role === 'restaurant' ? 'Restaurant' : 'NGO',
        location: user.location,
        appliedDate: new Date(user.createdAt).toLocaleDateString(),
        status: user.status.charAt(0).toUpperCase() + user.status.slice(1)
      }));

      setApprovals(formattedApprovals);
      setRestaurants(restaurantsRes.data);
      setStats(statsRes.data);

      // Create waste reduction chart data from restaurants
      const wasteData = restaurantsRes.data
        .filter((r: any) => r.wasteReduction > 0)
        .slice(0, 6)
        .map((r: any) => ({
          name: r.restaurantName,
          reduction: r.wasteReduction
        }));
      setWasteReductionData(wasteData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      const status = approved ? 'active' : 'rejected';
      await adminAPI.updateApproval(id, status);
      
      // Update local state
      setApprovals(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: approved ? 'Approved' : 'Rejected' } : item
        )
      );
      
      setNotificationMessage(approved ? 'Application approved successfully!' : 'Application rejected');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating approval:', error);
      setNotificationMessage('Error processing approval');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div className="min-h-screen pt-20 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3">Admin Control Panel</h1>
            <p className="text-gray-300 text-lg">Platform-wide analytics and management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Restaurants"
              value={restaurants.length}
              icon={Store}
              color="blue"
              subtitle="Active partners"
            />
            <StatCard
              title="Total Meals Donated"
              value={restaurants.reduce((sum, r) => sum + (r.mealsDonated || 0), 0)}
              icon={Users}
              color="orange"
              trend={`${approvals.filter(a => a.status === 'Pending').length} pending approvals`}
            />
            <StatCard
              title="Avg Waste Reduced"
              value={`${restaurants.length > 0 ? Math.round(restaurants.reduce((sum, r) => sum + (r.wasteReduction || 0), 0) / restaurants.length) : 0}%`}
              icon={TrendingDown}
              color="green"
              subtitle="Platform-wide"
              animate={false}
            />
            <StatCard
              title="Pending Approvals"
              value={approvals.filter(a => a.status === 'Pending').length}
              icon={Leaf}
              color="orange"
              subtitle="Awaiting review"
              animate={false}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <ChartCard title="Waste Reduction by Restaurant" subtitle="Top performers">
              {wasteReductionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={wasteReductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#fff" angle={-20} textAnchor="end" height={100} />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    />
                    <Bar dataKey="reduction" fill="#2D6A4F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No restaurant data available yet
                </div>
              )}
            </ChartCard>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <MapPin className="text-[#E85D04]" size={24} />
                <span>Platform Coverage Map</span>
              </h3>

              <div className="bg-white/5 rounded-xl p-8 mb-4 h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="text-[#2D6A4F] mx-auto mb-4" size={64} />
                  <p className="text-gray-400">Interactive map visualization</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {restaurants.length} restaurants and {approvals.filter(a => a.type === 'NGO' && a.status === 'Approved').length} NGOs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-3 h-3 bg-[#E85D04] rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-gray-400">Restaurants</div>
                  <div className="text-xl font-bold text-white">{restaurants.length}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-3 h-3 bg-[#2D6A4F] rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-gray-400">NGOs</div>
                  <div className="text-xl font-bold text-white">{approvals.filter(a => a.type === 'NGO' && a.status === 'Approved').length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#E85D04] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">Loading admin panel data...</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">Pending Approvals</h2>

                  {approvals.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                      <p className="text-gray-400 text-lg">No pending approvals at this time</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={[
                        { header: 'Name', accessor: 'name' },
                        {
                          header: 'Type',
                          accessor: 'type',
                          render: (value) => (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              value === 'Restaurant'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {value}
                            </span>
                          )
                        },
                        { header: 'Location', accessor: 'location' },
                        { header: 'Applied Date', accessor: 'appliedDate' },
                        {
                          header: 'Status',
                          accessor: 'status',
                          render: (value) => (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              value === 'Approved'
                                ? 'bg-green-500/20 text-green-400'
                                : value === 'Rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {value}
                            </span>
                          )
                        },
                        {
                          header: 'Actions',
                          accessor: 'id',
                          render: (value, row) => (
                            row.status === 'Pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproval(value, true)}
                                  className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleApproval(value, false)}
                                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )
                          )
                        }
                      ]}
                      data={approvals}
                    />
                  )}
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">Active Restaurants</h2>

                  {restaurants.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                      <p className="text-gray-400 text-lg">No active restaurants yet</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={[
                        { 
                          header: 'Name', 
                          accessor: 'restaurantName',
                          render: (value) => value || 'N/A'
                        },
                        { header: 'Location', accessor: 'location' },
                        {
                          header: 'Waste Reduction',
                          accessor: 'wasteReduction',
                          render: (value) => (
                            <span className="font-semibold text-green-400">{value || 0}%</span>
                          )
                        },
                        {
                          header: 'Meals Donated',
                          accessor: 'mealsDonated',
                          render: (value) => (
                            <span className="font-semibold text-[#E85D04]">{value || 0}</span>
                          )
                        },
                        {
                          header: 'Status',
                          accessor: 'status',
                          render: (value) => (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              value === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {value.charAt(0).toUpperCase() + value.slice(1)}
                            </span>
                          )
                        }
                      ]}
                      data={restaurants}
                    />
                  )}
                </div>
              </>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Platform Growth</h4>
                <div className="text-4xl font-bold text-white mb-2">+18%</div>
                <p className="text-gray-300 text-sm">New restaurants this month</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Impact Score</h4>
                <div className="text-4xl font-bold text-white mb-2">92/100</div>
                <p className="text-gray-300 text-sm">Environmental impact rating</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">User Satisfaction</h4>
                <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                <p className="text-gray-300 text-sm">Average platform rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNotification && (
        <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center space-x-3 z-50">
          <CheckCircle size={24} />
          <span className="font-semibold">{notificationMessage}</span>
        </div>
      )}
    </div>
  );
}
