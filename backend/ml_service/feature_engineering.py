"""
Feature Engineering Module
Creates advanced features for demand forecasting
"""

import pandas as pd
import numpy as np


class FeatureEngineer:
    """
    Handles feature engineering for the demand forecasting model
    """
    
    def __init__(self):
        self.numerical_features = []
        self.categorical_features = []
        self.feature_columns = []
    
    def create_price_features(self, df):
        """
        Create price-related features
        
        Args:
            df: pd.DataFrame
            
        Returns:
            pd.DataFrame: Data with price features
        """
        df = df.copy()
        
        # Profit margin
        df['profit_margin'] = df['selling_price'] - df['cost_price']
        df['profit_margin_pct'] = (df['profit_margin'] / df['selling_price']) * 100
        
        # Price elasticity indicator
        df['is_premium'] = (df['selling_price'] > df['selling_price'].median()).astype(int)
        
        return df
    
    def create_demand_features(self, df):
        """
        Create demand pattern features
        
        Args:
            df: pd.DataFrame
            
        Returns:
            pd.DataFrame: Data with demand features
        """
        df = df.copy()
        
        # Fill NaN values in std_last_7_days
        df['std_last_7_days'].fillna(0, inplace=True)
        
        # Demand volatility
        df['demand_volatility'] = df['std_last_7_days'] / (df['avg_last_7_days'] + 1)
        
        # Trend indicator (comparing recent vs older averages)
        df['demand_trend'] = (df['avg_last_7_days'] - df['avg_last_14_days']) / (df['avg_last_14_days'] + 1)
        
        # Momentum (yesterday vs 7-day average)
        df['momentum'] = (df['lag_1_days'] - df['avg_last_7_days']) / (df['avg_last_7_days'] + 1)
        
        return df
    
    def create_cyclic_features(self, df):
        """
        Create cyclic features for temporal data
        
        Args:
            df: pd.DataFrame
            
        Returns:
            pd.DataFrame: Data with cyclic features
        """
        df = df.copy()
        
        # Day of week cyclic
        df['day_of_week_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_of_week_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        
        # Month cyclic
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        return df
    
    def select_features(self, df, target_col='quantity_sold'):
        """
        Select final features for model training
        
        Args:
            df: pd.DataFrame
            target_col: str, name of target column
            
        Returns:
            tuple: (X, y, feature_names)
        """
        # Define feature columns
        feature_cols = [
            # Temporal features
            'day_of_week', 'is_weekend', 'day_of_month', 'month', 'quarter',
            'day_of_week_sin', 'day_of_week_cos', 'month_sin', 'month_cos',
            
            # Lag features
            'lag_1_days', 'lag_7_days', 'lag_14_days',
            
            # Rolling averages
            'avg_last_7_days', 'avg_last_14_days', 'avg_last_30_days',
            'std_last_7_days',
            
            # Price features
            'selling_price', 'cost_price', 'profit_margin', 'profit_margin_pct',
            'is_premium',
            
            # Demand features
            'demand_volatility', 'demand_trend', 'momentum'
        ]
        
        # Filter only existing columns
        available_cols = [col for col in feature_cols if col in df.columns]
        
        X = df[available_cols]
        y = df[target_col] if target_col in df.columns else None
        
        self.feature_columns = available_cols
        
        return X, y, available_cols
    
    def engineer_features(self, df):
        """
        Apply all feature engineering steps
        
        Args:
            df: pd.DataFrame
            
        Returns:
            pd.DataFrame: Data with all engineered features
        """
        df = df.copy()
        
        # Create price features
        if 'selling_price' in df.columns and 'cost_price' in df.columns:
            df = self.create_price_features(df)
        
        # Create demand features
        if 'avg_last_7_days' in df.columns:
            df = self.create_demand_features(df)
        
        # Create cyclic features
        if 'day_of_week' in df.columns and 'month' in df.columns:
            df = self.create_cyclic_features(df)
        
        return df
