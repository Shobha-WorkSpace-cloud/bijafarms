#!/bin/bash

echo "🚀 Starting Aura Haven Development Environment"
echo "============================================="

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo "🔄 Starting backend server on port 3001..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🔄 Starting frontend server on port 8080..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both services started!"
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT

# Wait for background processes
wait
