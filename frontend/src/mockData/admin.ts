export interface Restaurant {
  id: number;
  name: string;
  location: string;
  wasteReduction: number;
  mealsDonated: number;
  status: 'Active' | 'Pending' | 'Inactive';
}

export interface PendingApproval {
  id: number;
  name: string;
  type: 'Restaurant' | 'NGO';
  location: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Mock data removed - use real-time data from backend API
export const restaurants: Restaurant[] = [];

export const pendingApprovals: PendingApproval[] = [];

export const wasteReductionByRestaurant = [];
