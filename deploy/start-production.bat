@echo off
title MSNC PeopleHub - Production
cd /d "%~dp0\.."

if not exist ".next\standalone\server.js" (
    echo [RALAT] Standalone build tidak dijumpai.
    echo Jalankan dahulu: deploy\build-production.bat
    pause
    exit /b 1
)

set PORT=3000
set HOSTNAME=0.0.0.0

echo MSNC PeopleHub production server pada port %PORT%...
node .next\standalone\server.js