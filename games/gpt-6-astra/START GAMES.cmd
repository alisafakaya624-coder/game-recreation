@echo off
setlocal
cd /d "%~dp0"
set "ASTRA_NODE=%~dp0game-files\launcher\runtime\windows-x64\node.exe"
if not exist "%ASTRA_NODE%" (
 echo The bundled runtime is missing. Extract the entire ZIP before starting.
 pause
 exit /b 1
)
"%ASTRA_NODE%" "%~dp0game-files\launcher\server.mjs" --open --game "%~1"
if errorlevel 1 pause
