#!/bin/bash

# ZeroWaste AI - ML Service Startup Script

echo "🤖 Starting ML Demand Forecasting Service..."

cd "$(dirname "$0")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Check if model exists
if [ ! -f "model.pkl" ]; then
    echo "⚠️  No trained model found. The system will use fallback predictions."
    echo "   To train a model, run: python train_model.py"
fi

# Start Flask server
echo "🚀 Starting ML service on port 5002..."
export FLASK_ENV=development
python app.py
