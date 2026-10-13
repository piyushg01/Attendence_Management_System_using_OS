#ifndef SYSCALLS_H
#define SYSCALLS_H

typedef struct {
    char call_name[32];
    int syscall_number;
    char arguments[64];
    char user_context[64];
    char kernel_action[128];
    char return_value[32];
    char status[16];
} SyscallTraceStep;

typedef struct {
    char workflow[64];
    SyscallTraceStep steps[16];
    int step_count;
    char summary[256];
} SyscallTraceResult;

SyscallTraceResult trace_attendance_workflow_syscalls(void);
SyscallTraceResult trace_custom_syscall(const char *syscall_name);

#endif /* SYSCALLS_H */
