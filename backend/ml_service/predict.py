"""
Prediction Module
Makes predictions and generates production plans
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import json

from data_preprocessing import DataPreprocessor
from feature_engineering import FeatureEngineer


class ProductionPlanner:
    """
    Makes demand predictions and generates production plans
    """
    
    def __init__(self, model_path='model.pkl', metadata_path='model_metadata.json'):
        self.model = None
        self.feature_columns = []
        self.preprocessor = DataPreprocessor()
        self.feature_engineer = FeatureEngineer()
        self.metadata = {}
        
        # Load model if path exists
        try:
            self.load_model(model_path, metadata_path)
        except Exception as e:
            print(f"Warning: Could not load model - {e}")
    
    def load_model(self, model_path, metadata_path):
        """Load trained model and metadata"""
        self.model = joblib.load(model_path)
        
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
        
        self.feature_columns = self.metadata['feature_columns']
        print(f"Model loaded successfully. Test RMSE: {self.metadata['metrics'].get('test_rmse', 'N/A')}")
    
    def predict_demand(self, historical_data, dish_name, prediction_date=None):
        """
        Predict demand for a specific dish
        
        Args:
            historical_data: pd.DataFrame with historical sales
            dish_name: str, name of dish
            prediction_date: datetime, date to predict (default: tomorrow)
            
        Returns:
            float: Predicted quantity
        """
        if self.model is None:
            raise ValueError("Model not loaded. Cannot make predictions.")
        
        # Default to tomorrow
        if prediction_date is None:
            prediction_date = datetime.now() + timedelta(days=1)
        
        # Prepare prediction data
        pred_data = self.preprocessor.prepare_prediction_data(
            historical_data, dish_name, prediction_date
        )
        
        if pred_data is None:
            return 0
        
        # Feature engineering
        pred_data = self.feature_engineer.engineer_features(pred_data)
        
        # Select features
        X_pred = pred_data[self.feature_columns]
        
        # Make prediction
        prediction = self.model.predict(X_pred)[0]
        
        # Ensure non-negative
        prediction = max(0, prediction)
        
        return round(prediction, 2)
    
    def generate_production_plan(self, predictions, inventory_data, menu_items):
        """
        Generate comprehensive production plan
        
        Args:
            predictions: dict, {dish_name: predicted_quantity}
            inventory_data: list of dict, current inventory status
            menu_items: list of dict, menu items with pricing
            
        Returns:
            dict: Structured production plan
        """
        production_plan = {
            'timestamp': datetime.now().isoformat(),
            'predictions': [],
            'summary': {
                'total_dishes': len(predictions),
                'total_predicted_demand': 0,
                'total_recommended_production': 0,
                'high_waste_risk_count': 0,
                'donation_suggestions': 0,
                'expected_profit': 0
            },
            'waste_alerts': [],
            'donation_suggestions': []
        }
        
        # Create inventory lookup
        inventory_map = {}
        for item in inventory_data:
            # Map ingredient/itemName to quantity
            key = item.get('ingredient') or item.get('itemName', '')
            inventory_map[key.lower()] = item
        
        # Create menu item lookup
        menu_map = {item['name']: item for item in menu_items}
        
        # Process each prediction
        for dish_name, predicted_qty in predictions.items():
            if predicted_qty < 0:
                predicted_qty = 0
            
            # Get menu item details
            menu_item = menu_map.get(dish_name, {})
            selling_price = menu_item.get('price', 0)
            cost_price = selling_price * 0.6  # Assume 40% margin
            current_stock = menu_item.get('stock', 0)
            
            # Calculate production recommendation
            safety_buffer = 1.2  # 20% buffer
            recommended_production = round(predicted_qty * safety_buffer)
            
            # Check inventory for matching ingredients
            inventory_status = None
            for inv_key, inv_item in inventory_map.items():
                if dish_name.lower() in inv_key or inv_key in dish_name.lower():
                    inventory_status = inv_item
                    break
            
            # Determine priority and actions
            priority = 'Medium'
            action = 'Normal production'
            waste_risk = False
            suggest_donation = False
            
            if predicted_qty == 0:
                priority = 'Low'
                action = 'Skip production - no demand predicted'
                if current_stock > 10:
                    suggest_donation = True
                    action = 'Consider donation - no demand expected'
            elif predicted_qty < 5:
                priority = 'Low'
                action = 'Minimal production'
            elif predicted_qty < 15:
                priority = 'Medium'
                action = 'Moderate production'
            else:
                priority = 'High'
                action = 'High production - strong demand'
            
            # Check waste risk from inventory
            if inventory_status:
                inv_status = inventory_status.get('status', 'Good')
                if inv_status in ['Critical', 'Near Expiry']:
                    waste_risk = True
                    priority = 'Urgent'
                    action = f'USE IMMEDIATELY - {inv_status} inventory'
            
            # Check if current stock exceeds prediction
            if current_stock > predicted_qty * 1.5:
                waste_risk = True
                suggest_donation = True
                production_plan['waste_alerts'].append({
                    'dish': dish_name,
                    'current_stock': current_stock,
                    'predicted_demand': predicted_qty,
                    'excess': current_stock - predicted_qty,
                    'severity': 'high' if current_stock > predicted_qty * 2 else 'medium',
                    'message': f'Current stock ({current_stock}) exceeds prediction ({predicted_qty})',
                    'action': 'Consider donation or promotion'
                })
                recommended_production = 0  # Don't produce more
            
            # Calculate profit
            units_to_produce = recommended_production if recommended_production > 0 else predicted_qty
            expected_revenue = predicted_qty * selling_price
            expected_cost = units_to_produce * cost_price
            expected_profit = expected_revenue - expected_cost
            
            # Add to plan
            dish_plan = {
                'dish_name': dish_name,
                'predicted_demand': round(predicted_qty, 1),
                'current_stock': current_stock,
                'recommended_production': recommended_production,
                'priority': priority,
                'action': action,
                'waste_risk': waste_risk,
                'suggest_donation': suggest_donation,
                'selling_price': selling_price,
                'expected_profit': round(expected_profit, 2),
                'inventory_status': inventory_status.get('status') if inventory_status else 'Unknown'
            }
            
            production_plan['predictions'].append(dish_plan)
            
            # Update summary
            production_plan['summary']['total_predicted_demand'] += predicted_qty
            production_plan['summary']['total_recommended_production'] += recommended_production
            production_plan['summary']['expected_profit'] += expected_profit
            if waste_risk:
                production_plan['summary']['high_waste_risk_count'] += 1
            if suggest_donation:
                production_plan['summary']['donation_suggestions'] += 1
                production_plan['donation_suggestions'].append({
                    'dish': dish_name,
                    'current_stock': current_stock,
                    'predicted_demand': predicted_qty,
                    'suggested_donation_qty': max(0, current_stock - predicted_qty),
                    'reason': 'Excess inventory detected'
                })
        
        # Round summary values
        production_plan['summary']['total_predicted_demand'] = round(
            production_plan['summary']['total_predicted_demand'], 1
        )
        production_plan['summary']['total_recommended_production'] = round(
            production_plan['summary']['total_recommended_production'], 1
        )
        production_plan['summary']['expected_profit'] = round(
            production_plan['summary']['expected_profit'], 2
        )
        
        return production_plan
    
    def predict_all_dishes(self, historical_data, menu_items, prediction_date=None):
        """
        Predict demand for all dishes
        
        Args:
            historical_data: pd.DataFrame with historical sales
            menu_items: list of dict with menu items
            prediction_date: datetime, date to predict for
            
        Returns:
            dict: {dish_name: predicted_quantity}
        """
        predictions = {}
        
        for item in menu_items:
            dish_name = item['name']
            try:
                pred = self.predict_demand(historical_data, dish_name, prediction_date)
                predictions[dish_name] = pred
            except Exception as e:
                print(f"Warning: Could not predict for {dish_name} - {e}")
                # Use average demand as fallback
                dish_data = historical_data[historical_data['dish_name'] == dish_name]
                if len(dish_data) > 0:
                    predictions[dish_name] = dish_data['quantity_sold'].mean()
                else:
                    predictions[dish_name] = 0
        
        return predictions


# Example usage
if __name__ == "__main__":
    """
    Example prediction script
    """
    # Sample historical data
    sample_history = pd.DataFrame({
        'date': pd.date_range(start='2024-01-01', periods=30),
        'dish_name': ['Biryani'] * 30,
        'quantity_sold': np.random.randint(20, 50, 30),
        'selling_price': [250] * 30,
        'cost_price': [150] * 30
    })
    
    # Sample menu items
    menu_items = [
        {'name': 'Biryani', 'price': 250, 'stock': 60}
    ]
    
    # Sample inventory
    inventory = [
        {'ingredient': 'rice', 'quantity': 50, 'status': 'Good'}
    ]
    
    # Create planner
    planner = ProductionPlanner()
    
    # Make predictions
    predictions = planner.predict_all_dishes(sample_history, menu_items)
    print("Predictions:", predictions)
    
    # Generate production plan
    plan = planner.generate_production_plan(predictions, inventory, menu_items)
    print("\nProduction Plan:")
    print(json.dumps(plan, indent=2))
