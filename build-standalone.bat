@echo off
setlocal
cd /d "%~dp0"

echo Building Text Inspector...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-standalone.ps1" %*
if errorlevel 1 (
  echo.
  echo Build failed. Review the message above.
  pause
  exit /b 1
)

echo.
echo Build completed. See dist\.
start "" "%~dp0dist\index.html"
endlocal
