#include "../include/scheduling.h"

void run_fcfs(const PCB *input_procs, int count, SchedulingResult *result) {
    if (count <= 0) return;
    
    memset(result, 0, sizeof(SchedulingResult));
    strncpy(result->algorithm, "First-Come, First-Served (FCFS)", sizeof(result->algorithm) - 1);
    result->process_count = count;

    /* Copy and sort by arrival time */
    for (int i = 0; i < count; i++) {
        result->processes[i] = input_procs[i];
    }

    for (int i = 0; i < count - 1; i++) {
        for (int j = 0; j < count - i - 1; j++) {
            if (result->processes[j].arrival_time > result->processes[j + 1].arrival_time) {
                PCB temp = result->processes[j];
                result->processes[j] = result->processes[j + 1];
                result->processes[j + 1] = temp;
            }
        }
    }

    int current_time = 0;
    int total_waiting = 0;
    int total_turnaround = 0;
    int total_response = 0;
    int total_busy_time = 0;

    result->gantt_count = 0;

    for (int i = 0; i < count; i++) {
        PCB *p = &result->processes[i];

        if (current_time < p->arrival_time) {
            /* Idle block */
            GanttEntry *idle = &result->gantt[result->gantt_count++];
            idle->pid = -1;
            strncpy(idle->name, "IDLE", sizeof(idle->name) - 1);
            idle->start_time = current_time;
            idle->end_time = p->arrival_time;
            current_time = p->arrival_time;
        }

        p->start_time = current_time;
        p->response_time = p->start_time - p->arrival_time;
        p->completion_time = current_time + p->burst_time;
        p->turnaround_time = p->completion_time - p->arrival_time;
        p->waiting_time = p->turnaround_time - p->burst_time;
        p->remaining_time = 0;
        p->state = STATE_TERMINATED;

        GanttEntry *g = &result->gantt[result->gantt_count++];
        g->pid = p->pid;
        strncpy(g->name, p->name, sizeof(g->name) - 1);
        g->start_time = current_time;
        g->end_time = p->completion_time;

        current_time = p->completion_time;
        total_busy_time += p->burst_time;
        total_waiting += p->waiting_time;
        total_turnaround += p->turnaround_time;
        total_response += p->response_time;
    }

    result->avg_waiting_time = (double)total_waiting / count;
    result->avg_turnaround_time = (double)total_turnaround / count;
    result->avg_response_time = (double)total_response / count;
    result->cpu_utilization = current_time > 0 ? ((double)total_busy_time / current_time) * 100.0 : 0.0;
    result->throughput = current_time > 0 ? ((double)count / current_time) : 0.0;
}
