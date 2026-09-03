@echo off
title Create Desktop Shortcut for PureCheck AI
cls

echo =========================================================================
echo             CREATE PURECHECK AI DESKTOP SHORTCUT
echo =========================================================================
echo.
echo Creating Desktop Shortcut...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\create-shortcut.ps1"

echo.
pause
