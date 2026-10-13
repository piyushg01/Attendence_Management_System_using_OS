#include "../include/scheduling.h"

void run_priority(const PCB *input_procs, int count, bool preemptive, SchedulingResult *result) {
    if (count <= 0) return;

    memset(result, 0, sizeof(SchedulingResult));
    snprintf(result->algorithm, sizeof(result->algorithm), "%s", 
             preemptive ? "Priority Scheduling (Preemptive)" : "Priority Scheduling (Non-Preemptive)");
    result->process_count = count;

    for (int i = 0; i < count; i++) {
        result->processes[i] = input_procs[i];
        result->processes[i].remaining_time = input_procs[i].burst_time;
        result->processes[i].start_time = -1;
    }

    int completed = 0;
    int current_time = 0;
    int prev_pid = -2;
    int busy_time = 0;

    while (completed < count) {
        int best_idx = -1;
        int highest_prio = 999999; /* Lower number = higher priority */

        for (int i = 0; i < count; i++) {
            if (result->processes[i].arrival_time <= current_time && result->processes[i].remaining_time > 0) {
                if (result->processes[i].priority < highest_prio) {
                    highest_prio = result->processes[i].priority;
                    best_idx = i;
                } else if (result->processes[i].priority == highest_prio) {
                    if (best_idx != -1 && result->processes[i].arrival_time < result->processes[best_idx].arrival_time) {
                        best_idx = i;
                    }
                }
            }
        }

        if (best_idx == -1) {
            if (prev_pid != -1) {
                GanttEntry *idle = &result->gantt[result->gantt_count++];
                idle->pid = -1;
                strncpy(idle->name, "IDLE", sizeof(idle->name) - 1);
                idle->start_time = current_time;
                idle->end_time = current_time + 1;
                prev_pid = -1;
            } else {
                result->gantt[result->gantt_count - 1].end_time++;
            }
            current_time++;
            continue;
        }

        PCB *p = &result->processes[best_idx];

        if (p->start_time == -1) {
            p->start_time = current_time;
            p->response_time = p->start_time - p->arrival_time;
        }

        if (preemptive) {
            if (prev_pid != p->pid) {
                GanttEntry *g = &result->gantt[result->gantt_count++];
                g->pid = p->pid;
                strncpy(g->name, p->name, sizeof(g->name) - 1);
                g->start_time = current_time;
                g->end_time = current_time + 1;
                prev_pid = p->pid;
            } else {
                result->gantt[result->gantt_count - 1].end_time++;
            }

            p->remaining_time--;
            current_time++;
            busy_time++;

            if (p->remaining_time == 0) {
                p->completion_time = current_time;
                p->turnaround_time = p->completion_time - p->arrival_time;
                p->waiting_time = p->turnaround_time - p->burst_time;
                p->state = STATE_TERMINATED;
                completed++;
            }
        } else {
            GanttEntry *g = &result->gantt[result->gantt_count++];
            g->pid = p->pid;
            strncpy(g->name, p->name, sizeof(g->name) - 1);
            g->start_time = current_time;
            g->end_time = current_time + p->burst_time;

            current_time += p->burst_time;
            busy_time += p->burst_time;
            p->remaining_time = 0;
            p->completion_time = current_time;
            p->turnaround_time = p->completion_time - p->arrival_time;
            p->waiting_time = p->turnaround_time - p->burst_time;
            p->state = STATE_TERMINATED;
            completed++;
            prev_pid = p->pid;
        }
    }

    int total_waiting = 0;
    int total_turnaround = 0;
    int total_response = 0;

    for (int i = 0; i < count; i++) {
        total_waiting += result->processes[i].waiting_time;
        total_turnaround += result->processes[i].turnaround_time;
        total_response += result->processes[i].response_time;
    }

    result->avg_waiting_time = (double)total_waiting / count;
    result->avg_turnaround_time = (double)total_turnaround / count;
    result->avg_response_time = (double)total_response / count;
    result->cpu_utilization = current_time > 0 ? ((double)busy_time / current_time) * 100.0 : 0.0;
    result->throughput = current_time > 0 ? ((double)count / current_time) : 0.0;
}
