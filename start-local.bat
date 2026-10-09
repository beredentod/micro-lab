@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
echo Open http://localhost:8000 in your browser.
node server.mjs
pause
