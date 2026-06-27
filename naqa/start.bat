@echo off
title NAQA Server
cd /d "%~dp0"

echo.
echo  =============================
echo   NAQA Smart Farming Assistant
echo  =============================
echo.
echo  Starting local server on http://localhost:5173
echo  Your browser will open automatically.
echo  Press Ctrl+C to stop the server.
echo.

start "" "http://localhost:5173"

:: Try system Python first, then Anaconda
python --version >nul 2>&1
if %errorlevel% == 0 (
    python -m http.server 5173
) else (
    "%USERPROFILE%\anaconda3\python.exe" -m http.server 5173
)

pause
