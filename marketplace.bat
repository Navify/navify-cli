@echo off
setlocal
title Navify Marketplace
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0marketplace.ps1"
if errorlevel 1 (
  echo.
  echo Marketplace action failed.
  pause
)
endlocal
