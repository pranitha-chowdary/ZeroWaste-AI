export interface NGO {
  id: number;
  name: string;
  distance: string;
  contact: string;
  capacity: number;
}

export interface Donation {
  id: number;
  meals: number;
  type: string;
  expiry: string;
  status: 'Available' | 'Accepted' | 'Delivered';
  ngo?: string;
}

export interface DonationHistory {
  id: number;
  date: string;
  meals: number;
  ngo: string;
  type: string;
}

// Mock data removed - use real-time data from backend API
export const ngos: NGO[] = [];

export const availableDonations: Donation[] = [];

export const donationHistory: DonationHistory[] = [];
