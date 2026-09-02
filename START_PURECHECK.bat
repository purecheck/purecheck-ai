@echo off
title PureCheck AI — FreshScan & ProduceScan AI
cls

echo =========================================================================
echo               FRESHSCAN AI & PRODUCESCAN AI SYSTEM
echo =========================================================================
echo.
echo [1/2] Initializing Local AI Vision Application Environment...
echo [2/2] Starting Development Server and Web Interface...
echo.

:: Automatically open browser after 3 seconds in the background
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Execute npm run dev
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Server exited with an error (Code: %ERRORLEVEL%).
    pause
)
