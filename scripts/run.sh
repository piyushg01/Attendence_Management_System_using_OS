#!/usr/bin/env bash
# ========================================================
# OS-Based Attendance Management System Run Script
# ========================================================
echo "Starting OS-Based Attendance Management System..."

# Start backend in background
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Start frontend development server
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
