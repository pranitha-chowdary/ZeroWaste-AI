"""
Model Training Module
Trains XGBoost Regressor for demand forecasting
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import joblib
import json
from datetime import datetime

from data_preprocessing import DataPreprocessor
from feature_engineering import FeatureEngineer


class DemandForecaster:
    """
    Manages training and evaluation of the demand forecasting model
    """
    
    def __init__(self):
        self.model = None
        self.preprocessor = DataPreprocessor()
        self.feature_engineer = FeatureEngineer()
        self.feature_columns = []
        self.metrics = {}
    
    def train(self, data, test_size=0.2, random_state=42):
        """
        Train the XGBoost model
        
        Args:
            data: pd.DataFrame or dict with historical sales data
            test_size: float, proportion for test set
            random_state: int, random seed
            
        Returns:
            dict: Training metrics
        """
        print("Starting model training...")
        
        # Load and preprocess data
        df = self.preprocessor.load_data(data)
        df = self.preprocessor.prepare_training_data(df)
        
        print(f"Preprocessed data shape: {df.shape}")
        
        # Feature engineering
        df = self.feature_engineer.engineer_features(df)
        
        # Select features
        X, y, feature_names = self.feature_engineer.select_features(df)
        self.feature_columns = feature_names
        
        print(f"Features selected: {len(feature_names)}")
        print(f"Feature names: {feature_names}")
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, shuffle=False
        )
        
        print(f"Training set size: {len(X_train)}, Test set size: {len(X_test)}")
        
        # Initialize XGBoost model
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=random_state,
            n_jobs=-1
        )
        
        # Train model
        print("Training XGBoost model...")
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=20,
            verbose=False
        )
        
        # Predictions
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)
        
        # Calculate metrics
        self.metrics = {
            'train_rmse': np.sqrt(mean_squared_error(y_train, y_train_pred)),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_test_pred)),
            'train_mae': mean_absolute_error(y_train, y_train_pred),
            'test_mae': mean_absolute_error(y_test, y_test_pred),
            'train_r2': r2_score(y_train, y_train_pred),
            'test_r2': r2_score(y_test, y_test_pred),
            'train_size': len(X_train),
            'test_size': len(X_test),
            'num_features': len(feature_names)
        }
        
        print("\n=== Training Results ===")
        print(f"Train RMSE: {self.metrics['train_rmse']:.2f}")
        print(f"Test RMSE: {self.metrics['test_rmse']:.2f}")
        print(f"Test R²: {self.metrics['test_r2']:.3f}")
        
        return self.metrics
    
    def save_model(self, model_path='model.pkl', metadata_path='model_metadata.json'):
        """
        Save trained model and metadata
        
        Args:
            model_path: str, path to save model
            metadata_path: str, path to save metadata
        """
        if self.model is None:
            raise ValueError("No trained model to save. Train the model first.")
        
        # Save model
        joblib.dump(self.model, model_path)
        
        # Save metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'metrics': self.metrics,
            'timestamp': datetime.now().isoformat(),
            'model_type': 'XGBRegressor'
        }
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model saved to {model_path}")
        print(f"Metadata saved to {metadata_path}")
    
    def load_model(self, model_path='model.pkl', metadata_path='model_metadata.json'):
        """
        Load trained model and metadata
        
        Args:
            model_path: str, path to model file
            metadata_path: str, path to metadata file
        """
        # Load model
        self.model = joblib.load(model_path)
        
        # Load metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        self.feature_columns = metadata['feature_columns']
        self.metrics = metadata['metrics']
        
        print(f"Model loaded from {model_path}")
        print(f"Test RMSE: {self.metrics.get('test_rmse', 'N/A')}")
        
        return metadata


# Training script
if __name__ == "__main__":
    """
    Example training script
    """
    # Sample data structure
    sample_data = {
        'date': pd.date_range(start='2024-01-01', periods=100),
        'dish_name': ['Biryani'] * 50 + ['Dosa'] * 50,
        'quantity_sold': np.random.randint(20, 100, 100),
        'selling_price': [250] * 50 + [80] * 50,
        'cost_price': [150] * 50 + [30] * 50
    }
    
    df = pd.DataFrame(sample_data)
    
    # Train model
    forecaster = DemandForecaster()
    metrics = forecaster.train(df)
    
    # Save model
    forecaster.save_model()
    
    print("\nTraining complete!")
