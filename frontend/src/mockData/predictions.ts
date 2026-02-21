export interface PredictionData {
  date: string;
  historical: number;
  predicted: number;
}

export interface ProductionData {
  dish: string;
  recommended: number;
  actual: number;
}

// Mock data removed - use real-time data from backend API
export const demandPredictions: PredictionData[] = [];

export const productionData: ProductionData[] = [];
