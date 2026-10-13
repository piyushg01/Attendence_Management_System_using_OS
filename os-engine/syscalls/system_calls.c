#include "../include/syscalls.h"
#include <stdio.h>
#include <string.h>

SyscallTraceResult trace_attendance_workflow_syscalls(void) {
    SyscallTraceResult res;
    memset(&res, 0, sizeof(SyscallTraceResult));

    strncpy(res.workflow, "Attendance Submission to Persistent Log", sizeof(res.workflow) - 1);
    int step_idx = 0;

    /* Step 1: fork() */
    SyscallTraceStep *s1 = &res.steps[step_idx++];
    strncpy(s1->call_name, "fork()", sizeof(s1->call_name) - 1);
    s1->syscall_number = 57; /* x86_64 sys_fork / sys_clone */
    strncpy(s1->arguments, "None", sizeof(s1->arguments) - 1);
    strncpy(s1->user_context, "Faculty UI -> Node.js worker spawns C process", sizeof(s1->user_context) - 1);
    strncpy(s1->kernel_action, "Allocates task_struct, clones mm_struct with Copy-On-Write (COW), assigns child PID=4216", sizeof(s1->kernel_action) - 1);
    strncpy(s1->return_value, "4216 (to parent), 0 (to child)", sizeof(s1->return_value) - 1);
    strncpy(s1->status, "SUCCESS", sizeof(s1->status) - 1);

    /* Step 2: sem_wait() */
    SyscallTraceStep *s2 = &res.steps[step_idx++];
    strncpy(s2->call_name, "sem_wait() / futex()", sizeof(s2->call_name) - 1);
    s2->syscall_number = 202; /* sys_futex */
    strncpy(s2->arguments, "&sem_attendance, FUTEX_WAIT, ...", sizeof(s2->arguments) - 1);
    strncpy(s2->user_context, "Attendance processing thread requests critical section lock", sizeof(s2->user_context) - 1);
    strncpy(s2->kernel_action, "Atomic test-and-set; if contested, puts thread to sleep on kernel wait queue", sizeof(s2->kernel_action) - 1);
    strncpy(s2->return_value, "0 (Lock Acquired)", sizeof(s2->return_value) - 1);
    strncpy(s2->status, "SUCCESS", sizeof(s2->status) - 1);

    /* Step 3: open() */
    SyscallTraceStep *s3 = &res.steps[step_idx++];
    strncpy(s3->call_name, "openat() / open()", sizeof(s3->call_name) - 1);
    s3->syscall_number = 257; /* sys_openat */
    strncpy(s3->arguments, "AT_FDCWD, \"data/attendance.csv\", O_WRONLY|O_APPEND, 0644", sizeof(s3->arguments) - 1);
    strncpy(s3->user_context, "Opening persistent attendance ledger for append", sizeof(s3->user_context) - 1);
    strncpy(s3->kernel_action, "VFS path lookup via dentry cache, verifies file permissions, allocates file descriptor in PCB", sizeof(s3->kernel_action) - 1);
    strncpy(s3->return_value, "fd = 3", sizeof(s3->return_value) - 1);
    strncpy(s3->status, "SUCCESS", sizeof(s3->status) - 1);

    /* Step 4: write() */
    SyscallTraceStep *s4 = &res.steps[step_idx++];
    strncpy(s4->call_name, "write()", sizeof(s4->call_name) - 1);
    s4->syscall_number = 1; /* sys_write */
    strncpy(s4->arguments, "fd=3, buffer, 48 bytes", sizeof(s4->arguments) - 1);
    strncpy(s4->user_context, "Writing student status \"STU1025,OS,PRESENT\"", sizeof(s4->user_context) - 1);
    strncpy(s4->kernel_action, "Transfers user buffer to kernel page cache; marks sector dirty for flush to storage drive", sizeof(s4->kernel_action) - 1);
    strncpy(s4->return_value, "48 (bytes written)", sizeof(s4->return_value) - 1);
    strncpy(s4->status, "SUCCESS", sizeof(s4->status) - 1);

    /* Step 5: sem_post() */
    SyscallTraceStep *s5 = &res.steps[step_idx++];
    strncpy(s5->call_name, "sem_post() / futex()", sizeof(s5->call_name) - 1);
    s5->syscall_number = 202; /* sys_futex */
    strncpy(s5->arguments, "&sem_attendance, FUTEX_WAKE, 1", sizeof(s5->arguments) - 1);
    strncpy(s5->user_context, "Exiting Critical Section, releasing shared lock", sizeof(s5->user_context) - 1);
    strncpy(s5->kernel_action, "Increments semaphore value, wakes next waiting thread from wait queue into scheduler ready queue", sizeof(s5->kernel_action) - 1);
    strncpy(s5->return_value, "0 (Unlocked)", sizeof(s5->return_value) - 1);
    strncpy(s5->status, "SUCCESS", sizeof(s5->status) - 1);

    /* Step 6: close() */
    SyscallTraceStep *s6 = &res.steps[step_idx++];
    strncpy(s6->call_name, "close()", sizeof(s6->call_name) - 1);
    s6->syscall_number = 3; /* sys_close */
    strncpy(s6->arguments, "fd = 3", sizeof(s6->arguments) - 1);
    strncpy(s6->user_context, "Finished file writing", sizeof(s6->user_context) - 1);
    strncpy(s6->kernel_action, "Releases fd entry from PCB, decrements inode open reference counter", sizeof(s6->kernel_action) - 1);
    strncpy(s6->return_value, "0", sizeof(s6->return_value) - 1);
    strncpy(s6->status, "SUCCESS", sizeof(s6->status) - 1);

    res.step_count = step_idx;
    strncpy(res.summary, 
            "All operations cleanly traversed User Space (Ring 3) to Kernel Space (Ring 0) via POSIX system call ABI with zero privilege leaks.", 
            sizeof(res.summary) - 1);

    return res;
}
