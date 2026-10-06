@echo off
echo.
echo  ========================================
echo   🌱 La Ban Tuoi 15 - Khoi dong he thong
echo  ========================================
echo.

set NODE_PATH=C:\nodejs
set PATH=%NODE_PATH%;%PATH%

echo [1/2] Khoi dong Backend (port 3001)...
start "LBT15-Backend" cmd /k "cd /d %~dp0backend && set PATH=C:\nodejs;%PATH% && npx ts-node --transpile-only src/index.ts"

timeout /t 3 /nobreak >nul

echo [2/2] Khoi dong Frontend (port 5173)...
start "LBT15-Frontend" cmd /k "cd /d %~dp0frontend && set PATH=C:\nodejs;%PATH% && npm run dev"

echo.
echo  ✅ He thong dang khoi dong...
echo.
echo  📡 Backend:  http://localhost:3001
echo  🌐 Frontend: http://localhost:5173
echo.
echo  👤 Tai khoan demo:
echo     Hoc sinh:  hocsinh01 / Demo@123
echo     Giao vien: giaovien  / Demo@123
echo     Admin:     admin     / Admin@123
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173
