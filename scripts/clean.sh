#!/usr/bin/env bash
echo "Cleaning compiled C binaries and build artifacts..."
rm -f os-engine/os_engine os-engine/*.o
rm -rf frontend/dist
echo "Clean complete."
