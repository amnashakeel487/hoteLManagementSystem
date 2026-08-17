@echo off
echo Starting Hotel Management System Development Environment
echo.

REM Check if backend virtual environment exists
if not exist "backend\venv" (
    echo Backend not set up yet. Running setup...
    cd backend
    python setup.py
    cd ..
)

REM Start backend in new window
echo Starting Flask backend...
start "Flask Backend" cmd /c "cd backend && venv\Scripts\activate && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Start frontend
echo Starting React frontend...
start "React Frontend" cmd /c "npm run dev"

echo.
echo Development servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul