@echo off
REM Baking Shop - Docker Quick Deploy Script (Windows)
REM Usage: deploy.bat [dev|prod]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=dev

if /i "%ENVIRONMENT%"=="dev" (
    echo 🚀 Starting development environment...
    docker-compose up --build
) else if /i "%ENVIRONMENT%"=="prod" (
    echo 🚀 Starting production environment...
    if not exist .env.prod (
        echo ❌ Error: .env.prod file not found!
        echo Please create .env.prod with production secrets
        exit /b 1
    )
    docker-compose -f docker-compose.prod.yml up -d
    echo ✅ Production environment started
    docker-compose -f docker-compose.prod.yml ps
) else (
    echo Usage: deploy.bat [dev^|prod]
    echo   dev  - Start development environment with docker-compose
    echo   prod - Start production environment
    exit /b 1
)
