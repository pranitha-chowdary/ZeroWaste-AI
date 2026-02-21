import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const getRoleDisplay = () => {
    if (user.role === 'restaurant') return 'Restaurant';
    if (user.role === 'ngo') return 'NGO';
    return 'User';
  };

  const getStatusIcon = () => {
    if (user.status === 'pending') {
      return <Clock className="text-amber-400" size={64} />;
    } else if (user.status === 'rejected') {
      return <XCircle className="text-red-400" size={64} />;
    } else if (user.status === 'active') {
      return <CheckCircle className="text-green-400" size={64} />;
    }
    return <AlertCircle className="text-gray-400" size={64} />;
  };

  const getStatusMessage = () => {
    if (user.status === 'pending') {
      return {
        title: 'Application Under Review',
        message: 'Thank you for registering! Your application is currently being reviewed by our admin team.',
        detail: 'You will receive a notification once your account has been approved. This usually takes 1-2 business days.',
        color: 'amber'
      };
    } else if (user.status === 'rejected') {
      return {
        title: 'Application Not Approved',
        message: 'Unfortunately, your application was not approved at this time.',
        detail: 'Please contact our support team for more information or to submit a new application.',
        color: 'red'
      };
    } else if (user.status === 'active') {
      return {
        title: 'Account Activated!',
        message: 'Congratulations! Your account has been approved.',
        detail: 'You can now access your dashboard and start using the platform.',
        color: 'green'
      };
    }
    return {
      title: 'Account Status Unknown',
      message: 'There seems to be an issue with your account status.',
      detail: 'Please contact support for assistance.',
      color: 'gray'
    };
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div
        className="min-h-screen flex items-center justify-center px-6 pt-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F]/95 via-[#1F1F1F]/90 to-[#2D6A4F]/80" />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 shadow-2xl">
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-6 flex justify-center">
                {getStatusIcon()}
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Registered as</p>
                <h3 className="text-2xl font-bold text-white">{user.restaurantName || user.ngoName || user.name}</h3>
                <p className="text-gray-300 mt-1">{getRoleDisplay()} • {user.email}</p>
              </div>

              {/* Status Message */}
              <h1 className="text-4xl font-bold text-white mb-4">{statusInfo.title}</h1>
              <p className="text-xl text-gray-300 mb-4">{statusInfo.message}</p>
              <p className="text-gray-400 mb-8">{statusInfo.detail}</p>

              {/* Status Badge */}
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
                <div className={`w-3 h-3 rounded-full ${
                  user.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                  user.status === 'rejected' ? 'bg-red-400' :
                  user.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-white font-semibold capitalize">{user.status}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user.status === 'active' && (
                  <button
                    onClick={() => {
                      if (user.role === 'restaurant') navigate('/restaurant');
                      else if (user.role === 'ngo') navigate('/ngo');
                      else navigate('/customer');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Go to Dashboard
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="px-8 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                >
                  Logout
                </button>
              </div>

              {/* Additional Info */}
              {user.status === 'pending' && (
                <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-white font-semibold mb-3">What happens next?</h4>
                  <ul className="text-gray-300 text-sm space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="text-[#E85D04] mr-2">•</span>
                      <span>Our admin team will review your application details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#E85D04] mr-2">•</span>
                      <span>You'll receive an email notification once reviewed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#E85D04] mr-2">•</span>
                      <span>Check back here or try logging in to see your status</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
