@echo off
echo ========================================================
echo OS-Based Attendance Management System - Windows Build
echo ========================================================

echo [1/3] Compiling C OS Engine with MinGW GCC...
cd os-engine
gcc -O2 -Iinclude main_cli.c scheduling\fcfs.c scheduling\sjf.c scheduling\priority.c scheduling\round_robin.c process\pcb.c synchronization\semaphore.c synchronization\peterson.c deadlock\bankers.c deadlock\rag_detection.c filesystem\filesystem_demo.c syscalls\system_calls.c -o os_engine.exe
if %ERRORLEVEL% NEQ 0 (
    echo Error compiling C OS Engine!
    cd ..
    exit /b %ERRORLEVEL%
)
echo C OS Engine compiled successfully: os-engine\os_engine.exe
cd ..

echo [2/3] Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo [3/3] Building Frontend Bundle...
cd frontend
call npm install
call npm run build
cd ..

echo ========================================================
echo Build Completed Successfully!
echo Execute scripts\run.bat to launch the application.
echo ========================================================
