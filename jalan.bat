@echo off
title MSNC PeopleHub - HRMS Enterprise
cd /d "%~dp0"
echo.
echo  ========================================
echo   MSNC PeopleHub - HRMS Enterprise
echo   Menjalankan semua modul...
echo  ========================================
echo.
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)
echo Starting server at http://localhost:3000
echo.
call npm run dev