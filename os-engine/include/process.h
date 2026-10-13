#ifndef PROCESS_H
#define PROCESS_H

#include "os_engine.h"

typedef struct {
    int pid;
    int ppid;
    char command[64];
    ProcessState state;
    int priority;
    char memory_limits[32];
    int open_files[8];
    int open_file_count;
    char cpu_registers[64];
    char creation_time[32];
} DetailedPCB;

DetailedPCB create_attendance_process(int pid, int ppid, const char *cmd, int priority);

#endif /* PROCESS_H */
