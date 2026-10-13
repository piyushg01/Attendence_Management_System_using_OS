#!/usr/bin/env bash
# ========================================================
# OS-Based Attendance Management System Build Script
# ========================================================
set -e

echo "=== [1/3] Compiling Native C OS Engine ==="
cd os-engine
gcc -Wall -Wextra -O2 -Iinclude main_cli.c \
  scheduling/fcfs.c \
  scheduling/sjf.c \
  scheduling/priority.c \
  scheduling/round_robin.c \
  process/pcb.c \
  synchronization/semaphore.c \
  synchronization/peterson.c \
  deadlock/bankers.c \
  deadlock/rag_detection.c \
  filesystem/filesystem_demo.c \
  syscalls/system_calls.c \
  -o os_engine

echo "C OS Engine compiled successfully: os-engine/os_engine"
cd ..

echo "=== [2/3] Installing Backend Dependencies ==="
cd backend
npm install
cd ..

echo "=== [3/3] Installing Frontend Dependencies & Building ==="
cd frontend
npm install
npm run build
cd ..

echo "========================================================"
echo "Build Completed Successfully!"
echo "Run ./scripts/run.sh to start the platform."
echo "========================================================"
