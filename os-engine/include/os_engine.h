#ifndef OS_ENGINE_H
#define OS_ENGINE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAX_PROCESSES 64
#define MAX_RESOURCES 16
#define MAX_NAME_LEN 32
#define MAX_BLOCKS 128
#define MAX_PAGES 256
#define MAX_FRAMES 32

/* Process States in accordance with Operating System 5-state model */
typedef enum {
    STATE_NEW,
    STATE_READY,
    STATE_RUNNING,
    STATE_WAITING,
    STATE_TERMINATED
} ProcessState;

static inline const char* state_to_string(ProcessState state) {
    switch (state) {
        case STATE_NEW: return "NEW";
        case STATE_READY: return "READY";
        case STATE_RUNNING: return "RUNNING";
        case STATE_WAITING: return "WAITING";
        case STATE_TERMINATED: return "TERMINATED";
        default: return "UNKNOWN";
    }
}

/* Process Control Block (PCB) structure */
typedef struct {
    int pid;
    int ppid;
    char name[MAX_NAME_LEN];
    ProcessState state;
    int priority;
    int arrival_time;
    int burst_time;
    int remaining_time;
    int start_time;
    int completion_time;
    int turnaround_time;
    int waiting_time;
    int response_time;
    int memory_required;
    int allocated_frame;
} PCB;

/* Gantt Chart Entry */
typedef struct {
    int pid;
    char name[MAX_NAME_LEN];
    int start_time;
    int end_time;
} GanttEntry;

/* Scheduling Result structure */
typedef struct {
    char algorithm[64];
    int process_count;
    PCB processes[MAX_PROCESSES];
    int gantt_count;
    GanttEntry gantt[MAX_PROCESSES * 8];
    double avg_waiting_time;
    double avg_turnaround_time;
    double avg_response_time;
    double cpu_utilization;
    double throughput;
} SchedulingResult;

#endif /* OS_ENGINE_H */
