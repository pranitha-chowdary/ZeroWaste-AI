export interface InventoryItem {
  id: number;
  ingredient: string;
  quantity: string;
  expiry: string;
  status: 'Good' | 'Near Expiry' | 'Critical';
}

// Mock data removed - use real-time data from backend API
export const inventory: InventoryItem[] = [];
