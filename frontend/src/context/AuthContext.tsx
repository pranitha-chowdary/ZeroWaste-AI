import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'restaurant' | 'ngo' | 'customer';
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  restaurantName?: string;
  ngoName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ requiresOTP: boolean }>;
  register: (userData: any) => Promise<{ requiresOTP: boolean; email?: string; tempData?: any }>;
  verifyRegistration: (email: string, otp: string, userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
          setToken(savedToken);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, ...userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData as User);
      return { requiresOTP: false };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      // OTP flow: backend returns { requiresOTP: true, email, tempData }
      if (response.data.requiresOTP) {
        return { requiresOTP: true, email: response.data.email, tempData: response.data.tempData };
      }
      // Fallback: direct registration (no OTP) — shouldn't happen but handle anyway
      const { token: newToken, ...userData2 } = response.data;
      if (newToken) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData2 as User);
      }
      return { requiresOTP: false };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const verifyRegistration = async (email: string, otp: string, userData: any) => {
    try {
      const response = await authAPI.verifyRegistration({ email, otp, userData });
      const { token: newToken, ...user } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(user as User);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        verifyRegistration,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
