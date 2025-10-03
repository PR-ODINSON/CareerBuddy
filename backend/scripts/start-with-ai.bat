@echo off
REM CareerBuddy Backend Startup Script with AI Services (Windows)
REM This script ensures AI services are running before starting the backend

echo 🚀 Starting CareerBuddy Backend with AI Services...

REM Set default URLs
if "%AI_RESUME_ANALYZER_URL%"=="" set AI_RESUME_ANALYZER_URL=http://localhost:8001
if "%AI_JOB_MATCHER_URL%"=="" set AI_JOB_MATCHER_URL=http://localhost:8002

REM Function to check AI services
:check_ai_services
echo 🔍 Checking AI services...

set RESUME_ANALYZER_HEALTHY=false
set JOB_MATCHER_HEALTHY=false

REM Check Resume Analyzer
curl -f "%AI_RESUME_ANALYZER_URL%/health" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Resume Analyzer is healthy at %AI_RESUME_ANALYZER_URL%
    set RESUME_ANALYZER_HEALTHY=true
) else (
    echo ❌ Resume Analyzer is not responding at %AI_RESUME_ANALYZER_URL%
)

REM Check Job Matcher
curl -f "%AI_JOB_MATCHER_URL%/health" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Job Matcher is healthy at %AI_JOB_MATCHER_URL%
    set JOB_MATCHER_HEALTHY=true
) else (
    echo ❌ Job Matcher is not responding at %AI_JOB_MATCHER_URL%
)

if "%RESUME_ANALYZER_HEALTHY%"=="true" if "%JOB_MATCHER_HEALTHY%"=="true" (
    goto :services_ready
)
goto :services_not_ready

:services_ready
echo 🎉 All AI services are ready!
goto :start_backend

:services_not_ready
echo 🚀 AI services not detected. Attempting to start them...

REM Try to start AI services
if exist "..\ai-services\docker-compose.yml" (
    echo 📦 Starting AI services with docker-compose...
    cd ..\ai-services
    docker-compose up -d
    cd ..\backend
) else if exist "..\docker-compose.yml" (
    echo 📦 Starting all services with docker-compose...
    cd ..
    docker-compose up -d resume-analyzer job-matcher
    cd backend
) else (
    echo ❌ No docker-compose file found. Please set up AI services manually.
    echo.
    echo To set up AI services:
    echo 1. Install Docker and Docker Compose
    echo 2. Run 'docker-compose up -d' in the ai-services directory
    echo 3. Or run 'docker-compose up -d' in the project root
    echo.
    pause
    exit /b 1
)

REM Wait for services to be ready
echo ⏳ Waiting for AI services to be ready...
set /a ATTEMPT=1
set /a MAX_ATTEMPTS=30

:wait_loop
echo 🔄 Attempt %ATTEMPT%/%MAX_ATTEMPTS%

REM Check if services are ready
curl -f "%AI_RESUME_ANALYZER_URL%/health" >nul 2>&1
if %errorlevel%==0 (
    curl -f "%AI_JOB_MATCHER_URL%/health" >nul 2>&1
    if %errorlevel%==0 (
        echo 🎉 All AI services are ready!
        goto :start_backend
    )
)

if %ATTEMPT% lss %MAX_ATTEMPTS% (
    echo ⏰ Waiting 10 seconds before next attempt...
    timeout /t 10 /nobreak >nul
    set /a ATTEMPT+=1
    goto :wait_loop
)

echo ⚠️ AI services are not ready after %MAX_ATTEMPTS% attempts.
echo 🔧 Backend will start anyway, but AI features may not work.
echo.
echo To troubleshoot:
echo 1. Check if Docker is running
echo 2. Run 'docker-compose up -d' in the ai-services directory
echo 3. Check logs with 'docker-compose logs resume-analyzer job-matcher'
echo.

:start_backend
echo 🏃 Starting CareerBuddy Backend...

REM Start backend based on NODE_ENV
if "%NODE_ENV%"=="production" (
    echo 🏭 Starting in production mode...
    npm run start:prod
) else (
    echo 🛠️ Starting in development mode...
    npm run start:dev
)
