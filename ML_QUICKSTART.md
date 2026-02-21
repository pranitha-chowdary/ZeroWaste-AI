# Quick Start Guide - ML Demand Forecasting

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16+ (for backend)
- MongoDB running

## 🚀 Setup Steps

### 1. Install Python ML Service

```bash
cd backend/ml_service

# Option A: Using the startup script (Recommended)
./start.sh

# Option B: Manual installation
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generate Sample Training Data

```bash
# Generate sample data for testing
python generate_sample_data.py
```

This creates `sample_training_data.csv` with 90 days of sales data for 10 dishes.

### 3. Train the Model (Optional)

```bash
# Train with sample data
python train_model.py
```

This will:
- Load the sample data
- Train XGBoost model
- Save model as `model.pkl`
- Display training metrics

### 4. Start ML Service

```bash
# Start the Flask API server
python app.py
```

The ML service will run on **http://localhost:5002**

### 5. Start Node.js Backend

In a new terminal:

```bash
cd backend
npm install  # Install dependencies (including axios)
npm start    # Start backend server
```

Backend runs on **http://localhost:5001**

### 6. Start Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

## 🧪 Testing ML Integration

### Test ML Service Health

```bash
curl http://localhost:5002/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ML Demand Forecasting",
  "model_loaded": true
}
```

### Test Prediction via Node.js Backend

1. Login to restaurant dashboard
2. Navigate to **AI Predictions** tab
3. You should see:
   - ✅ "ML-powered optimization" in console
   - Demand predictions for each dish
   - Production recommendations
   - Waste alerts
   - Donation suggestions

## 📊 How It Works

```
Frontend (React)
    ↓
Node.js Backend (Port 5001)
    ↓ HTTP Request
Python ML Service (Port 5002)
    ↓ XGBoost Model
Predictions & Production Plan
    ↓
Frontend displays AI insights
```

## 🔄 Data Flow

1. **Frontend** requests optimization from Node.js backend
2. **Node.js** fetches:
   - Historical orders (last 30 days)
   - Current inventory
   - Menu items
3. **Node.js** sends data to ML service
4. **ML Service**:
   - Preprocesses data
   - Engineers features
   - Makes predictions using XGBoost
   - Generates production plan
5. **Node.js** formats response
6. **Frontend** displays results

## 🎯 Features

### Demand Forecasting
- Predicts tomorrow's demand for each dish
- Uses 30+ features including:
  - Day of week patterns
  - Historical demand (1d, 7d, 14d lags)
  - Rolling averages
  - Demand trends and volatility
  - Price information

### Production Planning
- Recommends production quantities
- Adds 20% safety buffer
- Flags waste risks
- Suggests donations for excess stock

### Waste Alerts
- Identifies dishes with current stock > predicted demand
- Severity levels (high/medium)
- Actionable recommendations

### Profit Insights
- Calculates expected profit per dish
- Ranks top performers
- Estimates total daily profit

## 🛠️ Troubleshooting

### ML Service Not Starting

```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check if dependencies installed
pip list | grep xgboost

# Reinstall dependencies
pip install -r requirements.txt
```

### "Model not loaded" Error

This is normal if you haven't trained a model yet. The system will:
1. Use fallback predictions based on historical averages
2. Still generate production plans
3. Work with rule-based optimization

To fix:
```bash
python generate_sample_data.py
python train_model.py
```

### Connection Error to ML Service

1. Verify ML service is running:
   ```bash
   curl http://localhost:5002/health
   ```

2. Check Node.js backend logs for ML errors

3. System automatically falls back to rule-based optimization if ML service unavailable

### No Historical Data

The system needs order history to make predictions. Options:

1. **Generate sample data** (for testing):
   ```bash
   python generate_sample_data.py
   ```

2. **Wait for real orders** to accumulate (recommended for production)

3. **System behavior**: Uses menu item averages or zeros for dishes with no history

## 📈 Model Performance

After training, check `model_metadata.json`:

```json
{
  "metrics": {
    "test_rmse": 8.45,
    "test_r2": 0.82,
    "test_mae": 6.23
  }
}
```

- **RMSE**: Lower is better (typical: 5-15 for restaurant data)
- **R²**: Higher is better (0.7+ is good)
- **MAE**: Average prediction error in units

## 🎨 Frontend Indicators

### ML-Powered Mode
- Console shows: `"Using ML-powered optimization"`
- Predictions based on XGBoost model
- More accurate and personalized

### Fallback Mode
- Console shows: `"ML service unavailable, using rule-based optimization"`
- Predictions based on business rules
- Still functional but less accurate

## 📝 Next Steps

1. ✅ Accumulate real order data
2. ✅ Train model with your data
3. ✅ Monitor prediction accuracy
4. ✅ Retrain periodically (weekly recommended)
5. ✅ Adjust model parameters based on performance

## 🔑 Environment Variables

Add to `backend/.env`:

```env
ML_SERVICE_URL=http://localhost:5002
```

If ML service is on different host/port, update accordingly.

## 💡 Tips

- **More data = better predictions**: Aim for at least 60-90 days
- **Retrain regularly**: Weekly or when menu changes
- **Monitor metrics**: Track RMSE over time
- **Adjust buffers**: Modify safety buffer (default 20%) based on needs
- **Seasonal patterns**: Model automatically learns from historical data
