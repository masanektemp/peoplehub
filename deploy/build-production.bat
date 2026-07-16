@echo off
title MSNC PeopleHub - Build Production
cd /d "%~dp0\.."

echo ========================================
echo  MSNC PeopleHub - Build untuk Windows Server
echo ========================================
echo.

call npm ci
if errorlevel 1 (
    echo [RALAT] npm ci gagal
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo [RALAT] Build gagal
    pause
    exit /b 1
)

call node scripts\windows\copy-standalone.js
if errorlevel 1 (
    echo [RALAT] Copy standalone gagal
    pause
    exit /b 1
)

echo.
echo ========================================
echo  BUILD BERJAYA
echo  Folder deploy: .next\standalone\
echo  Seterusnya: deploy\install-service.ps1
echo ========================================
pause