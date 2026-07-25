@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "INSTALL_SCRIPT=%SCRIPT_DIR%install.ps1"

if not exist "%INSTALL_SCRIPT%" (
  echo install.ps1 was not found next to this file.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_SCRIPT%" %*
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Navify installation failed with exit code %EXIT_CODE%.
  pause
)

exit /b %EXIT_CODE%