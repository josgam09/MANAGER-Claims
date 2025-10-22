@echo off
echo ========================================
echo   MANAGER Claims - Iniciando Servidor
echo ========================================
echo.

REM Detener cualquier proceso de Node.js corriendo
echo Deteniendo servidores anteriores...
taskkill /F /IM node.exe >nul 2>&1

REM Esperar 2 segundos
timeout /t 2 /nobreak >nul

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

REM Configurar variables de entorno
set BROWSER=none
set PORT=8081

echo.
echo Iniciando servidor en puerto 8081...
echo.
echo ========================================
echo   Accede a la plataforma en:
echo   http://localhost:8081
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar el servidor de desarrollo
npm run dev

pause



