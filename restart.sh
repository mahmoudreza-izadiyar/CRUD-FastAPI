#!/bin/bash

# Kill any existing processes
pkill -f "python run.py" || true
pkill -f "npm start" || true

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  echo "Activating virtual environment..."
  source venv/bin/activate
fi

# Install/update backend dependencies
echo "Installing/updating backend dependencies..."
pip install -r requirements.txt

# Install/update frontend dependencies
echo "Installing/updating frontend dependencies..."
cd frontend
npm install
cd ..

# Start the services
echo "Starting services..."
./run_dev.sh

echo "Application has been restarted!" 