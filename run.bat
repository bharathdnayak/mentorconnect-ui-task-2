@echo off
setlocal enabledelayedexpansion
title MentorConnect - Student-Faculty Mentoring Platform

echo ========================================================================
echo   __  __            _              ____                            _   
echo  ^|  \/  ^| ___ _ __ ^| ^|_ ___  _ __ / ___^|___  _ __  _ __   ___  ___^| ^|_ 
echo  ^| ^|\/^| ^|/ _ \ '_ \^| __/ _ \^| '__^| ^|   / _ \^| '_ \^| '_ \ / _ \/ __^| __^|
echo  ^| ^|  ^| ^|  __/ ^| ^| ^| ^|^| (_) ^| ^|  ^| ^|__^| (_) ^| ^| ^| ^| ^| ^| ^|  __/ (__^| ^|_ 
echo  ^|_^|  ^|_^|\___^|_^| ^|_^|\__\___/^|_^|   \____\___/^|_^| ^|_^|_^| ^|_^|\___^|\___^|\__^|
echo ========================================================================
echo   Production-Ready Mentor-Mentee Management System
echo   Repository: https://github.com/bharathdnayak/mentorconnect-ui-task-2.git
echo ========================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Check for .env file
if not exist .env (
    echo [Setup] .env file not found. Creating from .env.example...
    copy .env.example .env >nul
    echo [Setup] Created .env file.
)

:: 3. Check for node_modules
if not exist node_modules (
    echo [Setup] Installing workspace dependencies. Please wait...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 4. Build shared package if not already built
if not exist packages\shared\dist (
    echo [Setup] Compiling shared package...
    call npm run build -w packages/shared
)

:: 5. Display quick login credentials
echo.
echo ========================================================================
echo   Development Login Credentials (Password: Password123!)
echo ========================================================================
echo   [1] HOD Administrator:  hod.ise@college.edu
echo   [2] Faculty Mentor:     dr.sharma@college.edu
echo   [3] Student Mentee:     bharath.is@college.edu
echo ========================================================================
echo.
echo [Starting] Launching Backend API (port 5000) and Web Frontend (port 5173)...
echo [Starting] Opening browser at http://localhost:5173 ...
echo.

:: 6. Launch browser in background after short delay
start /b cmd /c "ping 127.0.0.1 -n 4 >nul && start http://localhost:5173"

:: 7. Start the application with concurrently
call npm run dev

pause
