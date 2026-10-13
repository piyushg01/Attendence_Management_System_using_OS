@echo off
echo Cleaning build artifacts...
del /q os-engine\os_engine.exe 2>nul
rmdir /s /q frontend\dist 2>nul
echo Clean complete.
