import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingDown, Users, Brain, Award, Leaf, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI Predictions',
      description: 'Smart demand forecasting using machine learning algorithms'
    },
    {
      icon: TrendingDown,
      title: 'Waste Reduction',
      description: 'Reduce food waste by up to 40% with intelligent planning'
    },
    {
      icon: Users,
      title: 'Social Impact',
      description: 'Connect surplus food with NGOs and those in need'
    },
    {
      icon: Award,
      title: 'Sustainability Score',
      description: 'Track and improve your environmental impact'
    }
  ];

  const stats = [
    { value: '3,420', label: 'Meals Donated', icon: ChefHat },
    { value: '24', label: 'Partner Restaurants', icon: Users },
    { value: '2.4T', label: 'CO₂ Saved', icon: Leaf },
    { value: '18%', label: 'Waste Reduced', icon: TrendingDown }
  ];

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Navbar />

      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F]/95 via-[#1F1F1F]/90 to-[#2D6A4F]/80" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
              <Leaf className="text-[#2D6A4F]" size={20} />
              <span className="text-[#FFF8E7] font-medium">Powered by AI & Sustainability</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered Zero Food
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85D04] to-[#2D6A4F]">
                Waste Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Predict. Optimize. Redistribute.
              <br />
              Transform your kitchen into a sustainable ecosystem
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <button
                onClick={() => navigate('/customer')}
                className="group px-8 py-4 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Explore Demo</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button
                onClick={() => navigate('/restaurant')}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                View Dashboard
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300"
                  >
                    <Icon className="text-[#E85D04] mb-3 mx-auto" size={32} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#1F1F1F] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose ZeroWaste AI?</h2>
            <p className="text-gray-400 text-lg">Cutting-edge technology meets sustainable practices</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E85D04] to-[#2D6A4F] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="relative py-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-[#1F1F1F]/90" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Make an Impact?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Join hundreds of restaurants in the fight against food waste
          </p>
          <button
            onClick={() => navigate('/restaurant')}
            className="px-8 py-4 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Get Started Today
          </button>
        </div>
      </div>

      <footer className="bg-[#1F1F1F] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 ZeroWaste AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
