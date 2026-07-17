@echo off
title MSNC PeopleHub - Dev Server
cd /d "%~dp0\.."
echo.
echo  ========================================
echo   MSNC PeopleHub - HRMS Enterprise
echo   Development server...
echo  ========================================
echo.
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)
echo Starting server at http://localhost:3000
echo.
call npm run dev