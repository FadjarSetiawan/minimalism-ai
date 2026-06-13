@echo off
title Minimalism AI Launcher

echo =====================================================================
echo ⬛ MINIMALISM AI — UNIFIED SYSTEM LAUNCHER (MVP V1.0)
echo Core Tone: Rational, Silent, Professional, Pure Speed.
echo =====================================================================
echo.

:: 1. Verify Node modules in backend
if not exist "backend-gateway\node_modules\" (
    echo [LAUNCHER]: Installing backend-gateway dependencies...
    cd backend-gateway
    call npm install
    cd ..
)

:: 2. Setup backend .env if not exists
if not exist "backend-gateway\.env" (
    echo [LAUNCHER]: Copying backend gateway .env template...
    copy "backend-gateway\.env.example" "backend-gateway\.env"
)

:: 3. Verify Node modules in frontend
if not exist "frontend-client\node_modules\" (
    echo [LAUNCHER]: Installing frontend-client dependencies...
    cd frontend-client
    call npm install
    cd ..
)

echo.
echo [LAUNCHER]: Booting Backend Gateway on port 3000...
start "Minimalism AI Backend" cmd /k "cd backend-gateway && npm run dev"

echo [LAUNCHER]: Booting Frontend Angular Client on port 4200...
start "Minimalism AI Frontend" cmd /k "cd frontend-client && npm start"

echo.
echo =====================================================================
echo ✅ LAUNCH PROCESSES INITIALIZED SUCCESSFULLY.
echo - API Gateway is accessible at http://localhost:3000
echo - Angular Application is launching at http://localhost:4200
echo.
echo Leave this launcher window open, or close it when done.
echo =====================================================================
pause
