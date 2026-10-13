@echo off
echo ========================================================
echo Starting OS-Based Attendance Management System...
echo ========================================================

start "OS Backend Bridge (Port 5000)" cmd /k "cd backend && npm start"
start "OS Frontend UI (Port 3000)" cmd /k "cd frontend && npm run dev"

echo Services launched!
echo Open http://localhost:3000 in your web browser.
