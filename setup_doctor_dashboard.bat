@echo off
echo ========================================
echo Doctor Dashboard Setup Script
echo ========================================
echo.

echo Step 1: Creating database tables...
cd backend\migrations
python create_doctor_tables.py
cd ..\..
echo.

echo Step 2: Checking dependencies...
cd backend
pip show psycopg2 >nul 2>&1
if errorlevel 1 (
    echo Installing psycopg2...
    pip install psycopg2-binary
)
cd ..
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& python app.py
echo 2. Start frontend: npm start
echo 3. Login as doctor to access dashboard
echo.
echo For detailed documentation, see DOCTOR_DASHBOARD_GUIDE.md
echo.
pause
