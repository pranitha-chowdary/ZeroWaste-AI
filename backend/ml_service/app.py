"""
Flask API Server for ML Demand Forecasting Service
Provides endpoints for the Node.js backend to access ML predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

from predict import ProductionPlanner
from train_model import DemandForecaster

app = Flask(__name__)
CORS(app)

# Initialize planner
planner = ProductionPlanner()

# Model paths
MODEL_PATH = 'model.pkl'
METADATA_PATH = 'model_metadata.json'


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Demand Forecasting',
        'model_loaded': planner.model is not None
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict demand and generate production plan
    
    Request body:
    {
        "historical_data": [...],  # List of sales records
        "menu_items": [...],       # List of menu items
        "inventory_data": [...]    # List of inventory items
    }
    
    Returns:
    {
        "success": true,
        "production_plan": {...}
    }
    """
    try:
        data = request.json
        
        # Extract data
        historical_data = data.get('historical_data', [])
        menu_items = data.get('menu_items', [])
        inventory_data = data.get('inventory_data', [])
        
        # Convert to DataFrame
        if len(historical_data) == 0:
            # Generate dummy predictions if no historical data
            predictions = {item['name']: 0 for item in menu_items}
        else:
            df = pd.DataFrame(historical_data)
            
            # Try to make predictions
            try:
                predictions = planner.predict_all_dishes(df, menu_items)
            except Exception as e:
                print(f"Prediction error: {e}")
                # Fallback to simple averaging
                predictions = {}
                for item in menu_items:
                    dish_data = df[df['dish_name'] == item['name']]
                    if len(dish_data) > 0:
                        predictions[item['name']] = dish_data['quantity_sold'].mean()
                    else:
                        predictions[item['name']] = 0
        
        # Generate production plan
        production_plan = planner.generate_production_plan(
            predictions, inventory_data, menu_items
        )
        
        return jsonify({
            'success': True,
            'production_plan': production_plan
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/train', methods=['POST'])
def train_model():
    """
    Train the model with provided data
    
    Request body:
    {
        "training_data": [...]  # List of historical sales records
    }
    
    Returns:
    {
        "success": true,
        "metrics": {...}
    }
    """
    try:
        data = request.json
        training_data = data.get('training_data', [])
        
        if len(training_data) < 50:
            return jsonify({
                'success': False,
                'error': 'Insufficient training data. Need at least 50 records.'
            }), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(training_data)
        
        # Train model
        forecaster = DemandForecaster()
        metrics = forecaster.train(df)
        
        # Save model
        forecaster.save_model(MODEL_PATH, METADATA_PATH)
        
        # Reload in planner
        planner.load_model(MODEL_PATH, METADATA_PATH)
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'message': 'Model trained successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/predict/dish/<dish_name>', methods=['POST'])
def predict_single_dish(dish_name):
    """
    Predict demand for a single dish
    
    Request body:
    {
        "historical_data": [...],
        "prediction_date": "2024-02-22"  # Optional
    }
    
    Returns:
    {
        "success": true,
        "dish_name": "...",
        "predicted_demand": 42.5
    }
    """
    try:
        data = request.json
        historical_data = data.get('historical_data', [])
        prediction_date_str = data.get('prediction_date')
        
        # Parse prediction date
        if prediction_date_str:
            prediction_date = datetime.fromisoformat(prediction_date_str)
        else:
            prediction_date = datetime.now() + timedelta(days=1)
        
        # Convert to DataFrame
        df = pd.DataFrame(historical_data)
        
        # Make prediction
        predicted_demand = planner.predict_demand(df, dish_name, prediction_date)
        
        return jsonify({
            'success': True,
            'dish_name': dish_name,
            'predicted_demand': predicted_demand,
            'prediction_date': prediction_date.isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
