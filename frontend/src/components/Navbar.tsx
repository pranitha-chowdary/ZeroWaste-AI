import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.status === 'pending' || user.status === 'rejected') return '/pending-approval';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'restaurant': return '/restaurant';
      case 'ngo': return '/ngo';
      case 'customer': return '/customer';
      default: return '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F1F1F]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-[#E85D04] to-[#2D6A4F] rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ZeroWaste AI</h1>
              <p className="text-xs text-gray-400">Smart Kitchen Ecosystem</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
                >
                  <User size={18} />
                  <span>{user.restaurantName || user.ngoName || user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-red-500/20 text-red-200 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-medium border border-red-500/30"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
