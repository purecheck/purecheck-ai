@echo off
title PureCheck AI — Fast Launcher
cls

echo =========================================================================
echo               PURECHECK AI — FAST LAUNCHER
echo =========================================================================
echo.
echo Launching local server and web application...
echo.

:: Change directory to script folder location
cd /d "%~dp0"

:: Open browser immediately / after 2 seconds
start /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173"

:: Execute npm run dev
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Server exited with error code %ERRORLEVEL%.
    pause
)
