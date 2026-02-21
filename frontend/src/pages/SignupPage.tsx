import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import OTPVerification from '../components/OTPVerification';
import { authAPI } from '../services/api';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Building, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, verifyRegistration } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    location: '',
    restaurantName: '',
    ngoName: '',
    capacity: '',
    distance: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: formData.location,
      };

      if (formData.role === 'restaurant') {
        userData.restaurantName = formData.restaurantName;
      } else if (formData.role === 'ngo') {
        userData.ngoName = formData.ngoName;
        userData.capacity = parseInt(formData.capacity);
        userData.distance = formData.distance;
      }

      const result = await register(userData);

      if (result.requiresOTP) {
        // Show OTP verification screen
        setOtpEmail(formData.email);
        setPendingUserData(userData);
        setShowOTP(true);
      } else {
        // Direct registration (no OTP) — navigate to dashboard
        navigateByRole(formData.role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateByRole = (role: string) => {
    if (role === 'restaurant' || role === 'ngo') {
      navigate('/pending-approval');
    } else if (role === 'customer') {
      navigate('/customer');
    } else {
      navigate('/');
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      await verifyRegistration(otpEmail, otp, pendingUserData);
      navigateByRole(pendingUserData?.role || 'customer');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPResend = async () => {
    setOtpError('');
    try {
      await authAPI.resendOTP({ email: otpEmail, purpose: 'registration' });
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div
        className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F]/95 via-[#1F1F1F]/90 to-[#2D6A4F]/80" />

        {/* OTP Verification Screen */}
        {showOTP ? (
          <div className="relative z-10 w-full max-w-md my-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <button
                onClick={() => { setShowOTP(false); setOtpError(''); }}
                className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
              >
                ← Back to form
              </button>
              <OTPVerification
                email={otpEmail}
                purpose="registration"
                onVerify={handleOTPVerify}
                onResend={handleOTPResend}
                isLoading={otpLoading}
                error={otpError}
              />
            </div>
          </div>
        ) : (

        <div className="relative z-10 w-full max-w-2xl my-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] rounded-full mb-4">
                <UserPlus className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-300">Join ZeroWaste AI Platform</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3">
                <AlertCircle className="text-red-400" size={20} />
                <span className="text-red-200">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">I am a</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                  required
                >
                  <option value="customer" className="bg-[#1F1F1F]">Customer</option>
                  <option value="restaurant" className="bg-[#1F1F1F]">Restaurant Owner</option>
                  <option value="ngo" className="bg-[#1F1F1F]">NGO Representative</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="City, State"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Restaurant-specific fields */}
              {formData.role === 'restaurant' && (
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Restaurant Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                      placeholder="Your restaurant name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* NGO-specific fields */}
              {formData.role === 'ngo' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">NGO Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="ngoName"
                        value={formData.ngoName}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                        placeholder="Your NGO name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Capacity (people)</label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                        placeholder="50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Distance</label>
                      <input
                        type="text"
                        name="distance"
                        value={formData.distance}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent"
                        placeholder="5 km"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-[#E85D04] hover:text-[#2D6A4F] font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
