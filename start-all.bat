@echo off
echo ================================================
echo  Emergency Responder Dashboard - Starting
echo ================================================
echo.
echo Starting 3 processes in separate windows:
echo   1. Backend API       -  http://localhost:5000
echo   2. Simulation Engine -  writes to MongoDB every 10s
echo   3. Frontend          -  http://localhost:5173
echo.

set ROOT=%~dp0

start "Backend API" cmd /k "cd /d %ROOT%backend && npm start"
timeout /t 3 /nobreak >nul

start "Simulator Engine" cmd /k "cd /d %ROOT%simulator && npm start"
timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo All processes launched in separate windows.
echo Open http://localhost:5173 in your browser.
echo.
pause
