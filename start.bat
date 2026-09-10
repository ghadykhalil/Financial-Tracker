@echo off
echo =========================================================
echo   Launching Financial & CS 1.6 Shop Tracker Web App
echo =========================================================
echo.
echo Starting Express Backend (Port 5000)...
start "Financial Tracker Backend" cmd /k "cd /d %~dp0server && node index.js"

echo Starting React Frontend (Vite)...
start "Financial Tracker Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo App launching! Opening browser at http://localhost:5173...
timeout /t 3 >nul
start http://localhost:5173
