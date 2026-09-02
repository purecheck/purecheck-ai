@echo off
title ProduceScan AI — Fruits & Vegetables Quality Analysis
cls

echo =========================================================================
echo              PRODUCESCAN AI — FRUITS & VEGETABLES ANALYZER
echo =========================================================================
echo.
echo Launching Multimodal PicSet Quality Scanner...
echo.

:: Automatically open browser directly to /produce after 3 seconds
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173/produce"

:: Run development server
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Server exited with error code %ERRORLEVEL%.
    pause
)
