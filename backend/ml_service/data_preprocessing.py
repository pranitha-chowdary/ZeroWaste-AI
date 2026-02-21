"""
Data Preprocessing Module
Handles data loading, cleaning, and preparation for the demand forecasting model
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta


class DataPreprocessor:
    """
    Handles all data preprocessing tasks for demand forecasting
    """
    
    def __init__(self):
        self.required_columns = [
            'date', 'dish_name', 'quantity_sold', 'selling_price', 'cost_price'
        ]
    
    def load_data(self, data):
        """
        Load data from dictionary or DataFrame
        
        Args:
            data: dict or pd.DataFrame with sales data
            
        Returns:
            pd.DataFrame: Cleaned DataFrame
        """
        if isinstance(data, dict):
            df = pd.DataFrame(data)
        else:
            df = data.copy()
        
        # Convert date to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        return df
    
    def clean_data(self, df):
        """
        Clean the dataset by removing nulls and invalid values
        
        Args:
            df: pd.DataFrame
            
        Returns:
            pd.DataFrame: Cleaned data
        """
        # Remove rows with null values in essential columns
        df = df.dropna(subset=['date', 'dish_name', 'quantity_sold'])
        
        # Remove negative quantities
        df = df[df['quantity_sold'] >= 0]
        
        # Fill missing prices with median
        df['selling_price'].fillna(df['selling_price'].median(), inplace=True)
        df['cost_price'].fillna(df['cost_price'].median(), inplace=True)
        
        # Sort by date
        df = df.sort_values('date')
        
        return df
    
    def add_temporal_features(self, df):
        """
        Add time-based features
        
        Args:
            df: pd.DataFrame with 'date' column
            
        Returns:
            pd.DataFrame: Data with temporal features
        """
        df = df.copy()
        
        # Day of week (0 = Monday, 6 = Sunday)
        df['day_of_week'] = df['date'].dt.dayofweek
        
        # Is weekend
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        # Day of month
        df['day_of_month'] = df['date'].dt.day
        
        # Month
        df['month'] = df['date'].dt.month
        
        # Quarter
        df['quarter'] = df['date'].dt.quarter
        
        # Week of year
        df['week_of_year'] = df['date'].dt.isocalendar().week
        
        return df
    
    def add_lag_features(self, df, dish_name, lag_periods=[1, 7, 14]):
        """
        Add lag features for a specific dish
        
        Args:
            df: pd.DataFrame
            dish_name: str, name of the dish
            lag_periods: list of int, lag periods to create
            
        Returns:
            pd.DataFrame: Data with lag features
        """
        df = df.copy()
        
        # Filter for specific dish
        dish_df = df[df['dish_name'] == dish_name].copy()
        dish_df = dish_df.sort_values('date')
        
        # Add lag features
        for lag in lag_periods:
            dish_df[f'lag_{lag}_days'] = dish_df['quantity_sold'].shift(lag)
        
        # Add rolling averages
        dish_df['avg_last_7_days'] = dish_df['quantity_sold'].rolling(window=7, min_periods=1).mean()
        dish_df['avg_last_14_days'] = dish_df['quantity_sold'].rolling(window=14, min_periods=1).mean()
        dish_df['avg_last_30_days'] = dish_df['quantity_sold'].rolling(window=30, min_periods=1).mean()
        
        # Add rolling std
        dish_df['std_last_7_days'] = dish_df['quantity_sold'].rolling(window=7, min_periods=1).std()
        
        return dish_df
    
    def prepare_training_data(self, df):
        """
        Prepare complete dataset with all features for all dishes
        
        Args:
            df: pd.DataFrame with raw sales data
            
        Returns:
            pd.DataFrame: Complete processed dataset
        """
        # Load and clean
        df = self.clean_data(df)
        
        # Add temporal features
        df = self.add_temporal_features(df)
        
        # Add lag features for each dish
        all_dishes = []
        for dish_name in df['dish_name'].unique():
            dish_data = self.add_lag_features(df, dish_name)
            all_dishes.append(dish_data)
        
        # Combine all dishes
        final_df = pd.concat(all_dishes, ignore_index=True)
        
        # Remove rows with NaN lag features (first few days)
        final_df = final_df.dropna()
        
        return final_df
    
    def prepare_prediction_data(self, historical_data, dish_name, prediction_date):
        """
        Prepare data for prediction (tomorrow's demand)
        
        Args:
            historical_data: pd.DataFrame with historical sales
            dish_name: str, name of dish to predict
            prediction_date: datetime, date to predict for
            
        Returns:
            pd.DataFrame: Single row ready for prediction
        """
        # Get historical data for this dish
        dish_df = historical_data[historical_data['dish_name'] == dish_name].copy()
        dish_df = dish_df.sort_values('date')
        
        if len(dish_df) == 0:
            return None
        
        # Create prediction row
        pred_row = pd.DataFrame({
            'date': [prediction_date],
            'dish_name': [dish_name]
        })
        
        # Add temporal features
        pred_row['day_of_week'] = prediction_date.weekday()
        pred_row['is_weekend'] = int(prediction_date.weekday() >= 5)
        pred_row['day_of_month'] = prediction_date.day
        pred_row['month'] = prediction_date.month
        pred_row['quarter'] = (prediction_date.month - 1) // 3 + 1
        pred_row['week_of_year'] = prediction_date.isocalendar()[1]
        
        # Add lag features (yesterday = lag 1)
        if len(dish_df) >= 1:
            pred_row['lag_1_days'] = dish_df['quantity_sold'].iloc[-1]
        else:
            pred_row['lag_1_days'] = 0
        
        if len(dish_df) >= 7:
            pred_row['lag_7_days'] = dish_df['quantity_sold'].iloc[-7]
        else:
            pred_row['lag_7_days'] = dish_df['quantity_sold'].mean()
        
        if len(dish_df) >= 14:
            pred_row['lag_14_days'] = dish_df['quantity_sold'].iloc[-14]
        else:
            pred_row['lag_14_days'] = dish_df['quantity_sold'].mean()
        
        # Add rolling averages
        pred_row['avg_last_7_days'] = dish_df['quantity_sold'].tail(7).mean()
        pred_row['avg_last_14_days'] = dish_df['quantity_sold'].tail(14).mean()
        pred_row['avg_last_30_days'] = dish_df['quantity_sold'].tail(30).mean()
        pred_row['std_last_7_days'] = dish_df['quantity_sold'].tail(7).std()
        
        # Add price features
        pred_row['selling_price'] = dish_df['selling_price'].iloc[-1] if 'selling_price' in dish_df else 0
        pred_row['cost_price'] = dish_df['cost_price'].iloc[-1] if 'cost_price' in dish_df else 0
        
        return pred_row
