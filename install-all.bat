@echo off
echo ================================================
echo  Emergency Responder Dashboard - Setup
echo ================================================
echo.

echo [1/3] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Backend npm install failed && pause && exit /b 1 )
cd ..
echo.

echo [2/3] Installing Simulator dependencies...
cd simulator
call npm install
if %errorlevel% neq 0 ( echo ERROR: Simulator npm install failed && pause && exit /b 1 )
cd ..
echo.

echo [3/3] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Frontend npm install failed && pause && exit /b 1 )
cd ..
echo.

echo ================================================
echo  All dependencies installed!
echo.
echo  Open 3 Command Prompt windows and run:
echo.
echo   Window 1:  cd backend   ^&^& npm start
echo   Window 2:  cd simulator ^&^& npm start
echo   Window 3:  cd frontend  ^&^& npm run dev
echo.
echo  Then open: http://localhost:5173
echo ================================================
pause
