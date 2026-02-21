export interface PreOrder {
  id: number;
  customerName: string;
  dish: string;
  quantity: number;
  pickupTime: string;
  status: 'Confirmed' | 'Preparing' | 'Ready' | 'Completed';
}

// Mock data removed - use real-time data from backend API
export const preOrders: PreOrder[] = [];
