@echo off
REM Lecture Notes Analyzer - Setup Script for Windows

echo ========================================
echo Lecture Notes Analyzer - Setup
echo ========================================
echo.

REM Backend Setup
echo [1/3] Setting up Backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Backend setup failed!
    exit /b 1
)
echo Backend setup complete!
cd ..
echo.

REM Frontend Setup
echo [2/3] Setting up Frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Frontend setup failed!
    exit /b 1
)
echo Frontend setup complete!
cd ..
echo.

REM NLP Service Setup
echo [3/3] Setting up NLP Service...
cd nlp_service
call python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo NLP Service setup failed!
    exit /b 1
)
echo NLP Service setup complete!
cd ..
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run all services:
echo   npm run dev:all
echo.
echo Or run individually:
echo   cd backend ^&^& npm run dev
echo   cd frontend ^&^& npm run dev  
echo   cd nlp_service ^&^& python -m uvicorn main:app --reload --port 8000
echo.
pause