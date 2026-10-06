@echo off
cd /d "%~dp0"
node open-local.mjs
if errorlevel 1 pause
