@echo off
setlocal
title Uninstall Navify
echo.
echo This removes installed Navify and restores Spotify.
echo Your source folder will stay on this computer.
echo.
choice /C YN /M "Continue"
if errorlevel 2 exit /b 0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall-navify.ps1"
if errorlevel 1 (
  echo.
  echo Uninstall failed.
  pause
)
endlocal
