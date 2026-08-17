#!/bin/bash

echo "🏨 Starting Hotel Management System Development Environment"
echo "========================================================="

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Backend not set up yet. Running setup..."
    cd backend
    python3 setup.py
    cd ..
fi

# Start backend in background
echo "🔨 Starting Flask backend..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background  
echo "⚛️ Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Development servers started!"
echo "📊 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "👤 Test Accounts:"
echo "• Admin: admin@stayfolio.com / admin123"
echo "• Hotel Owner: owner@marlowhotel.com / owner123"
echo "• Customer: customer@example.com / customer123"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for user to stop
wait