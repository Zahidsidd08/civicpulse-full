@echo off
echo ========================================================
echo        Civic Pulse - Full Stack Development Server
echo ========================================================
echo.
echo 1. Starting Node.js + Express Backend on http://localhost:5000 ...
start "CivicPulse Backend" cmd /k "cd backend && npm start"

echo.
echo 2. Starting Vite React Frontend on http://localhost:5173 ...
start "CivicPulse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Opening browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173
echo.
echo Both servers are running! Check the separate terminal windows.
echo Press any key to exit this launcher window.
pause >nul
