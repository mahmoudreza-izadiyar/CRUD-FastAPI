#!/bin/bash

# Check if background processes are enabled
if [ "$(uname)" == "Darwin" ]; then
  # macOS
  # Start the backend server
  echo "Starting FastAPI backend server..."
  python run.py &
  BACKEND_PID=$!
  
  # Wait a moment for the backend to start
  sleep 2
  
  # Start the frontend development server
  echo "Starting React frontend development server..."
  cd frontend && npm start
  
  # Kill the backend server when the frontend is stopped
  kill $BACKEND_PID
else
  # Linux/Windows
  # Start the backend server
  echo "Starting FastAPI backend server..."
  start python run.py
  
  # Wait a moment for the backend to start
  sleep 2
  
  # Start the frontend development server
  echo "Starting React frontend development server..."
  cd frontend && npm start
fi 