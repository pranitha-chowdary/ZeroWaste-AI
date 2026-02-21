export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

// Mock data removed - use real-time data from backend API
export const menuItems: MenuItem[] = [];
