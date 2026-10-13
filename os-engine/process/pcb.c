#include "../include/process.h"
#include <time.h>

DetailedPCB create_attendance_process(int pid, int ppid, const char *cmd, int priority) {
    DetailedPCB pcb;
    memset(&pcb, 0, sizeof(DetailedPCB));

    pcb.pid = pid;
    pcb.ppid = ppid;
    strncpy(pcb.command, cmd ? cmd : "attendance_daemon", sizeof(pcb.command) - 1);
    pcb.state = STATE_NEW;
    pcb.priority = priority;
    strncpy(pcb.memory_limits, "0x00400000 - 0x00800000 (4MB)", sizeof(pcb.memory_limits) - 1);
    
    /* Standard file descriptors 0 (stdin), 1 (stdout), 2 (stderr), 3 (attendance.log) */
    pcb.open_files[0] = 0;
    pcb.open_files[1] = 1;
    pcb.open_files[2] = 2;
    pcb.open_files[3] = 3;
    pcb.open_file_count = 4;

    strncpy(pcb.cpu_registers, "EAX:0x00EBX:0x10ECX:0x00ESP:0x7FFE", sizeof(pcb.cpu_registers) - 1);
    strncpy(pcb.creation_time, "2026-10-08 23:30:00", sizeof(pcb.creation_time) - 1);

    return pcb;
}
