import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  verifyRegistration: (data: { email: string; otp: string; userData: any }) => 
    api.post('/auth/verify-registration', data),
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  verifyLogin: (data: { email: string; otp: string }) => 
    api.post('/auth/verify-login', data),
  resendOTP: (data: { email: string; purpose: string }) => 
    api.post('/auth/resend-otp', data),
  getProfile: () => api.get('/auth/profile'),
};

// Menu APIs
export const menuAPI = {
  getActiveRestaurants: () => api.get('/menu/restaurants'),
  getAll: () => api.get('/menu'),
  getByRestaurant: (id: string) => api.get(`/menu/restaurant/${id}`),
  create: (menuItem: any) => api.post('/menu', menuItem),
  update: (id: string, menuItem: any) => api.put(`/menu/${id}`, menuItem),
  delete: (id: string) => api.delete(`/menu/${id}`),
};

// Order APIs
export const orderAPI = {
  create: (orderData: any) => api.post('/orders', orderData),
  getRestaurantOrders: () => api.get('/orders/restaurant'),
  getCustomerOrders: () => api.get('/orders/customer'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => 
    api.put(`/orders/${id}/status`, { status }),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (item: any) => api.post('/inventory', item),
  update: (id: string, item: any) => api.put(`/inventory/${id}`, item),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

// Donation APIs
export const donationAPI = {
  getAvailable: () => api.get('/donations'),
  getRestaurantDonations: () => api.get('/donations/restaurant'),
  getNGODonations: () => api.get('/donations/ngo'),
  getHistory: () => api.get('/donations/history'),
  create: (donation: any) => api.post('/donations', donation),
  accept: (id: string, data?: any) => api.put(`/donations/${id}/accept`, data),
  markDelivered: (id: string) => api.put(`/donations/${id}/deliver`),
};

// Prediction APIs
export const predictionAPI = {
  getDemand: () => api.get('/predictions/demand'),
  getProduction: () => api.get('/predictions/production'),
  getOptimization: () => api.get('/predictions/optimize'),
  getMLOptimization: () => api.get('/predictions/ml-optimize'),
  create: (prediction: any) => api.post('/predictions', prediction),
  updateActual: (id: string, data: any) => api.put(`/predictions/${id}/actual`, data),
};

// Admin APIs
export const adminAPI = {
  getRestaurants: () => api.get('/admin/restaurants'),
  getNGOs: () => api.get('/admin/ngos'),
  getApprovals: () => api.get('/admin/approvals'),
  updateApproval: (id: string, status: string) => 
    api.put(`/admin/approvals/${id}`, { status }),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
};

// NGO APIs
export const ngoAPI = {
  getAll: () => api.get('/ngos'),
};

export default api;
