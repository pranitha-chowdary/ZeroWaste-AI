# ML Demand Forecasting Service

Production-ready XGBoost-based demand forecasting engine for restaurant AI dashboard.

## Features

- **XGBoost Regressor** for accurate demand predictions
- **Feature Engineering** with temporal, lag, and demand pattern features
- **Production Planning** with waste alerts and donation suggestions
- **REST API** for easy integration with Node.js backend
- **Modular Architecture** for maintainability

## Setup

### 1. Install Python Dependencies

```bash
cd backend/ml_service
pip install -r requirements.txt
```

### 2. Start ML Service

```bash
python app.py
```

The service will run on **http://localhost:5002**

## API Endpoints

### Health Check
```
GET /health
```

### Generate Production Plan
```
POST /predict
Body: {
  "historical_data": [...],
  "menu_items": [...],
  "inventory_data": [...]
}
```

### Train Model
```
POST /train
Body: {
  "training_data": [...]
}
```

### Predict Single Dish
```
POST /predict/dish/<dish_name>
Body: {
  "historical_data": [...],
  "prediction_date": "2024-02-22"
}
```

## Module Structure

```
ml_service/
├── app.py                      # Flask API server
├── data_preprocessing.py       # Data cleaning and preparation
├── feature_engineering.py      # Feature creation
├── train_model.py             # Model training
├── predict.py                 # Predictions and planning
├── requirements.txt           # Python dependencies
├── model.pkl                  # Trained model (generated)
└── model_metadata.json        # Model metadata (generated)
```

## Data Format

### Historical Sales Data
```json
{
  "date": "2024-02-20",
  "dish_name": "Biryani",
  "quantity_sold": 45,
  "selling_price": 250,
  "cost_price": 150
}
```

### Production Plan Output
```json
{
  "timestamp": "2024-02-21T10:00:00",
  "predictions": [
    {
      "dish_name": "Biryani",
      "predicted_demand": 42.5,
      "recommended_production": 51,
      "priority": "High",
      "waste_risk": false,
      "expected_profit": 4250
    }
  ],
  "waste_alerts": [...],
  "donation_suggestions": [...]
}
```

## Training

Train the model with historical data:

```bash
python train_model.py
```

Or via API:
```bash
curl -X POST http://localhost:5002/train \
  -H "Content-Type: application/json" \
  -d '{"training_data": [...]}'
```

## Integration with Node.js

The ML service integrates seamlessly with the Node.js backend:

1. ML service runs on port 5002
2. Node.js backend calls ML endpoints
3. Frontend receives enriched AI predictions

## Features Engineered

- Temporal: day_of_week, is_weekend, month, quarter
- Lag: 1-day, 7-day, 14-day historical demand
- Rolling: 7-day, 14-day, 30-day averages
- Demand: volatility, trend, momentum
- Price: profit margin, price elasticity
- Cyclic: sin/cos encoding for temporal patterns

## Model Performance

- Uses 80/20 train-test split
- Evaluates with RMSE, MAE, R² metrics
- Early stopping to prevent overfitting
- Saves best model automatically
