#include "../include/scheduling.h"

void run_round_robin(const PCB *input_procs, int count, int quantum, SchedulingResult *result) {
    if (count <= 0 || quantum <= 0) return;

    memset(result, 0, sizeof(SchedulingResult));
    snprintf(result->algorithm, sizeof(result->algorithm), "Round Robin (RR, q=%d)", quantum);
    result->process_count = count;

    for (int i = 0; i < count; i++) {
        result->processes[i] = input_procs[i];
        result->processes[i].remaining_time = input_procs[i].burst_time;
        result->processes[i].start_time = -1;
    }

    int queue[MAX_PROCESSES * 8];
    int head = 0, tail = 0;
    bool in_queue[MAX_PROCESSES] = {false};

    int completed = 0;
    int current_time = 0;
    int busy_time = 0;

    /* Push processes that arrive at time 0 */
    for (int i = 0; i < count; i++) {
        if (result->processes[i].arrival_time <= current_time) {
            queue[tail++] = i;
            in_queue[i] = true;
        }
    }

    while (completed < count) {
        if (head == tail) {
            /* Queue empty, check if any upcoming process arrives */
            int next_arr = 999999;
            for (int i = 0; i < count; i++) {
                if (result->processes[i].remaining_time > 0 && result->processes[i].arrival_time > current_time) {
                    if (result->processes[i].arrival_time < next_arr) {
                        next_arr = result->processes[i].arrival_time;
                    }
                }
            }

            if (next_arr == 999999) break;

            GanttEntry *idle = &result->gantt[result->gantt_count++];
            idle->pid = -1;
            strncpy(idle->name, "IDLE", sizeof(idle->name) - 1);
            idle->start_time = current_time;
            idle->end_time = next_arr;
            current_time = next_arr;

            for (int i = 0; i < count; i++) {
                if (result->processes[i].remaining_time > 0 && result->processes[i].arrival_time <= current_time && !in_queue[i]) {
                    queue[tail++] = i;
                    in_queue[i] = true;
                }
            }
            continue;
        }

        int curr_idx = queue[head++];
        in_queue[curr_idx] = false;
        PCB *p = &result->processes[curr_idx];

        if (p->start_time == -1) {
            p->start_time = current_time;
            p->response_time = p->start_time - p->arrival_time;
        }

        int exec_time = (p->remaining_time > quantum) ? quantum : p->remaining_time;

        GanttEntry *g = &result->gantt[result->gantt_count++];
        g->pid = p->pid;
        strncpy(g->name, p->name, sizeof(g->name) - 1);
        g->start_time = current_time;
        g->end_time = current_time + exec_time;

        p->remaining_time -= exec_time;
        current_time += exec_time;
        busy_time += exec_time;

        /* Enqueue newly arrived processes during this time slice */
        for (int i = 0; i < count; i++) {
            if (i != curr_idx && result->processes[i].remaining_time > 0 && 
                result->processes[i].arrival_time <= current_time && !in_queue[i]) {
                queue[tail++] = i;
                in_queue[i] = true;
            }
        }

        if (p->remaining_time > 0) {
            /* Put back in queue */
            queue[tail++] = curr_idx;
            in_queue[curr_idx] = true;
        } else {
            p->completion_time = current_time;
            p->turnaround_time = p->completion_time - p->arrival_time;
            p->waiting_time = p->turnaround_time - p->burst_time;
            p->state = STATE_TERMINATED;
            completed++;
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
