@echo off
REM Prediction Review System - Quick Fix Script
REM Run this to diagnose and fix prediction review issues

echo ============================================================
echo Prediction Review System - Quick Fix
echo ============================================================
echo.

cd /d "%~dp0backend"

echo Step 1: Checking Python environment...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
echo.

echo Step 2: Installing required packages...
pip install flask flask-sqlalchemy psycopg2-binary python-dotenv
echo.

echo Step 3: Running diagnostic script...
python verify_prediction_system.py
echo.

echo Step 4: Applying database migration...
echo.
echo Please run this SQL script manually in your database:
echo   migrations/fix_prediction_review.sql
echo.
echo Or use psql:
echo   psql -U your_user -d your_database -f migrations/fix_prediction_review.sql
echo.

echo ============================================================
echo Fix Complete!
echo ============================================================
echo.
echo Next Steps:
echo 1. Start backend: python app.py
echo 2. Start frontend: npm start
echo 3. Login as doctor
echo 4. Check Doctor Dashboard - Prediction Reviews section
echo.

pause
