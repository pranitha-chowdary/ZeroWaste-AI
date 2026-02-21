"""
Generate Sample Training Data
Creates realistic sample data for initial model training
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

# Set random seed for reproducibility
np.random.seed(42)

def generate_sample_data(num_days=90, num_dishes=10):
    """
    Generate sample restaurant sales data
    
    Args:
        num_days: Number of days of historical data
        num_dishes: Number of different dishes
        
    Returns:
        pd.DataFrame: Sample sales data
    """
    # Define sample dishes with base demand levels
    dishes = [
        {'name': 'Biryani', 'price': 250, 'cost': 150, 'base_demand': 45, 'weekend_boost': 1.3},
        {'name': 'Dosa', 'price': 80, 'cost': 30, 'base_demand': 60, 'weekend_boost': 1.1},
        {'name': 'Idli', 'price': 50, 'cost': 20, 'base_demand': 70, 'weekend_boost': 1.0},
        {'name': 'Vada', 'price': 40, 'cost': 15, 'base_demand': 55, 'weekend_boost': 1.0},
        {'name': 'Paneer Butter Masala', 'price': 220, 'cost': 120, 'base_demand': 35, 'weekend_boost': 1.4},
        {'name': 'Dal Makhani', 'price': 180, 'cost': 90, 'base_demand': 40, 'weekend_boost': 1.2},
        {'name': 'Naan', 'price': 45, 'cost': 20, 'base_demand': 50, 'weekend_boost': 1.2},
        {'name': 'Samosa', 'price': 30, 'cost': 12, 'base_demand': 65, 'weekend_boost': 1.1},
        {'name': 'Chai', 'price': 20, 'cost': 8, 'base_demand': 80, 'weekend_boost': 1.0},
        {'name': 'Palak Paneer', 'price': 200, 'cost': 110, 'base_demand': 30, 'weekend_boost': 1.3},
    ][:num_dishes]
    
    # Generate dates
    end_date = datetime.now()
    start_date = end_date - timedelta(days=num_days)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Generate sales data
    data = []
    
    for date in dates:
        is_weekend = date.weekday() >= 5
        
        for dish in dishes:
            # Base demand with some randomness
            base = dish['base_demand']
            
            # Apply weekend boost
            if is_weekend:
                base *= dish['weekend_boost']
            
            # Add trend (slight increase over time)
            days_from_start = (date - start_date).days
            trend = 1.0 + (days_from_start / num_days) * 0.1  # 10% growth over period
            
            # Add random variation
            variation = np.random.normal(1.0, 0.15)  # 15% standard deviation
            
            # Calculate quantity
            quantity = int(base * trend * variation)
            quantity = max(0, quantity)  # Ensure non-negative
            
            # Add record
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'dish_name': dish['name'],
                'quantity_sold': quantity,
                'selling_price': dish['price'],
                'cost_price': dish['cost']
            })
    
    df = pd.DataFrame(data)
    return df


if __name__ == "__main__":
    print("Generating sample training data...")
    
    # Generate 90 days of data for 10 dishes
    df = generate_sample_data(num_days=90, num_dishes=10)
    
    print(f"Generated {len(df)} records")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Dishes: {df['dish_name'].nunique()}")
    print(f"\nSample data:")
    print(df.head(10))
    
    # Save to CSV
    df.to_csv('sample_training_data.csv', index=False)
    print(f"\n✅ Saved to sample_training_data.csv")
    
    # Save to JSON
    df.to_json('sample_training_data.json', orient='records', indent=2)
    print(f"✅ Saved to sample_training_data.json")
    
    # Print statistics
    print(f"\n📊 Statistics:")
    print(f"Total sales records: {len(df)}")
    print(f"Average daily quantity per dish: {df.groupby('dish_name')['quantity_sold'].mean().mean():.1f}")
    print(f"Total quantity sold: {df['quantity_sold'].sum()}")
