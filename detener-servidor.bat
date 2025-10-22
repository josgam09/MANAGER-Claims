@echo off
echo ========================================
echo   MANAGER Claims - Detener Servidor
echo ========================================
echo.

REM Detener todos los procesos de Node.js
echo Deteniendo todos los servidores Node.js...
taskkill /F /IM node.exe >nul 2>&1

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Servidores detenidos exitosamente
) ELSE (
    echo.
    echo ℹ No se encontraron servidores corriendo
)

echo.
pause



