#include "include/os_engine.h"
#include "include/scheduling.h"
#include "include/process.h"
#include "include/sync.h"
#include "include/deadlock.h"
#include "include/filesystem.h"
#include "include/syscalls.h"

static void print_scheduling_json(const SchedulingResult *r) {
    printf("{\n");
    printf("  \"algorithm\": \"%s\",\n", r->algorithm);
    printf("  \"process_count\": %d,\n", r->process_count);
    printf("  \"avg_waiting_time\": %.2f,\n", r->avg_waiting_time);
    printf("  \"avg_turnaround_time\": %.2f,\n", r->avg_turnaround_time);
    printf("  \"avg_response_time\": %.2f,\n", r->avg_response_time);
    printf("  \"cpu_utilization\": %.2f,\n", r->cpu_utilization);
    printf("  \"throughput\": %.4f,\n", r->throughput);
    printf("  \"processes\": [\n");
    for (int i = 0; i < r->process_count; i++) {
        const PCB *p = &r->processes[i];
        printf("    {\"pid\": %d, \"name\": \"%s\", \"arrival_time\": %d, \"burst_time\": %d, \"priority\": %d, \"start_time\": %d, \"completion_time\": %d, \"turnaround_time\": %d, \"waiting_time\": %d, \"response_time\": %d}%s\n",
               p->pid, p->name, p->arrival_time, p->burst_time, p->priority, p->start_time, p->completion_time, p->turnaround_time, p->waiting_time, p->response_time,
               (i < r->process_count - 1) ? "," : "");
    }
    printf("  ],\n");
    printf("  \"gantt\": [\n");
    for (int i = 0; i < r->gantt_count; i++) {
        const GanttEntry *g = &r->gantt[i];
        printf("    {\"pid\": %d, \"name\": \"%s\", \"start_time\": %d, \"end_time\": %d}%s\n",
               g->pid, g->name, g->start_time, g->end_time,
               (i < r->gantt_count - 1) ? "," : "");
    }
    printf("  ]\n");
    printf("}\n");
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("{\"error\": \"No command specified. Usage: os_engine [command] [args...]\"}\n");
        return 1;
    }

    const char *cmd = argv[1];

    /* Sample processes for scheduling */
    PCB sample_procs[5] = {
        {1, 0, "P1 (MarkAttendance)", STATE_READY, 2, 0, 5, 5, 0, 0, 0, 0, 0, 1024, 0},
        {2, 0, "P2 (CalcPercentage)", STATE_READY, 1, 1, 3, 3, 0, 0, 0, 0, 0, 2048, 0},
        {3, 0, "P3 (GenerateReport)", STATE_READY, 3, 2, 8, 8, 0, 0, 0, 0, 0, 4096, 0},
        {4, 0, "P4 (DefaulterCheck)", STATE_READY, 2, 3, 4, 4, 0, 0, 0, 0, 0, 1024, 0},
        {5, 0, "P5 (SyncFileFlush)",   STATE_READY, 4, 4, 2, 2, 0, 0, 0, 0, 0, 512,  0}
    };
    int proc_cnt = 5;

    /* 1. CPU SCHEDULING (Timetable & Time-Sharing) */
    if (strcmp(cmd, "schedule") == 0) {
        const char *algo = (argc >= 3) ? argv[2] : "fcfs";
        int quantum = (argc >= 4) ? atoi(argv[3]) : 3;

        SchedulingResult res;
        if (strcmp(algo, "sjf") == 0) {
            run_sjf(sample_procs, proc_cnt, false, &res);
        } else if (strcmp(algo, "srtf") == 0) {
            run_sjf(sample_procs, proc_cnt, true, &res);
        } else if (strcmp(algo, "priority") == 0) {
            run_priority(sample_procs, proc_cnt, false, &res);
        } else if (strcmp(algo, "priority_preempt") == 0) {
            run_priority(sample_procs, proc_cnt, true, &res);
        } else if (strcmp(algo, "rr") == 0 || strcmp(algo, "round_robin") == 0) {
            run_round_robin(sample_procs, proc_cnt, quantum, &res);
        } else {
            run_fcfs(sample_procs, proc_cnt, &res);
        }

        print_scheduling_json(&res);
        return 0;
    }

    if (strcmp(cmd, "compare_scheduling") == 0) {
        SchedulingResult fcfs_r, sjf_r, srtf_r, prio_r, rr_r;
        run_fcfs(sample_procs, proc_cnt, &fcfs_r);
        run_sjf(sample_procs, proc_cnt, false, &sjf_r);
        run_sjf(sample_procs, proc_cnt, true, &srtf_r);
        run_priority(sample_procs, proc_cnt, false, &prio_r);
        run_round_robin(sample_procs, proc_cnt, 3, &rr_r);

        printf("{\n");
        printf("  \"comparison\": [\n");
        printf("    {\"name\": \"FCFS\", \"avg_waiting\": %.2f, \"avg_turnaround\": %.2f, \"avg_response\": %.2f, \"utilization\": %.2f},\n", fcfs_r.avg_waiting_time, fcfs_r.avg_turnaround_time, fcfs_r.avg_response_time, fcfs_r.cpu_utilization);
        printf("    {\"name\": \"SJF Non-Preemptive\", \"avg_waiting\": %.2f, \"avg_turnaround\": %.2f, \"avg_response\": %.2f, \"utilization\": %.2f},\n", sjf_r.avg_waiting_time, sjf_r.avg_turnaround_time, sjf_r.avg_response_time, sjf_r.cpu_utilization);
        printf("    {\"name\": \"SRTF (SJF Preemptive)\", \"avg_waiting\": %.2f, \"avg_turnaround\": %.2f, \"avg_response\": %.2f, \"utilization\": %.2f},\n", srtf_r.avg_waiting_time, srtf_r.avg_turnaround_time, srtf_r.avg_response_time, srtf_r.cpu_utilization);
        printf("    {\"name\": \"Priority Non-Preemptive\", \"avg_waiting\": %.2f, \"avg_turnaround\": %.2f, \"avg_response\": %.2f, \"utilization\": %.2f},\n", prio_r.avg_waiting_time, prio_r.avg_turnaround_time, prio_r.avg_response_time, prio_r.cpu_utilization);
        printf("    {\"name\": \"Round Robin (q=3)\", \"avg_waiting\": %.2f, \"avg_turnaround\": %.2f, \"avg_response\": %.2f, \"utilization\": %.2f}\n", rr_r.avg_waiting_time, rr_r.avg_turnaround_time, rr_r.avg_response_time, rr_r.cpu_utilization);
        printf("  ]\n");
        printf("}\n");
        return 0;
    }

    /* 2. SYNCHRONIZATION & MUTEX LOCKING */
    if (strcmp(cmd, "sync") == 0) {
        const char *stype = (argc >= 3) ? argv[2] : "peterson";

        if (strcmp(stype, "peterson") == 0) {
            PetersonSimulation p = run_peterson_simulation();
            printf("{\n");
            printf("  \"mutual_exclusion\": %s,\n", p.mutual_exclusion_held ? "true" : "false");
            printf("  \"progress\": %s,\n", p.progress_satisfied ? "true" : "false");
            printf("  \"bounded_waiting\": %s,\n", p.bounded_waiting_satisfied ? "true" : "false");
            printf("  \"steps\": [\n");
            for (int i = 0; i < p.step_count; i++) {
                PetersonStep *s = &p.steps[i];
                printf("    {\"step\": %d, \"process\": \"%s\", \"action\": \"%s\", \"flag0\": %d, \"flag1\": %d, \"turn\": %d, \"critical_section\": \"%s\", \"explanation\": \"%s\"}%s\n",
                       s->step_number, s->process_name, s->action, s->flag0, s->flag1, s->turn, s->critical_section, s->explanation,
                       (i < p.step_count - 1) ? "," : "");
            }
            printf("  ]\n");
            printf("}\n");
            return 0;
        }

        if (strcmp(stype, "race_unprotected") == 0 || strcmp(stype, "race_protected") == 0) {
            bool protect = (strcmp(stype, "race_protected") == 0);
            ConcurrencyResult c = run_race_condition_demo(protect);
            printf("{\n");
            printf("  \"mode\": \"%s\",\n", c.mode);
            printf("  \"final_value\": %d,\n", c.final_record_value);
            printf("  \"expected_value\": %d,\n", c.expected_value);
            printf("  \"race_detected\": %s,\n", c.race_condition_detected ? "true" : "false");
            printf("  \"logs\": [\n");
            for (int i = 0; i < c.log_count; i++) {
                SyncLogEntry *l = &c.logs[i];
                printf("    {\"actor\": \"%s\", \"operation\": \"%s\", \"before\": %d, \"after\": %d, \"locked\": %d, \"status\": \"%s\", \"timestamp\": \"%s\"}%s\n",
                       l->actor, l->operation, l->resource_value_before, l->resource_value_after, l->lock_status, l->status, l->timestamp,
                       (i < c.log_count - 1) ? "," : "");
            }
            printf("  ]\n");
            printf("}\n");
            return 0;
        }
    }

    /* 3. DEADLOCK AVOIDANCE & DETECTION (Banker's Algorithm & RAG) */
    if (strcmp(cmd, "deadlock") == 0) {
        const char *dtype = (argc >= 3) ? argv[2] : "bankers";

        if (strcmp(dtype, "bankers") == 0) {
            BankersInput b_in = {
                5, 3,
                {"P0 (MarkAttendance)", "P1 (GenerateReport)", "P2 (UpdateStudent)", "P3 (AuditSync)", "P4 (DefaulterNotifier)"},
                {"R1 (AttendanceFile)", "R2 (DBLock)", "R3 (PDFPrinter)"},
                {3, 3, 2},
                {
                    {7, 5, 3},
                    {3, 2, 2},
                    {9, 0, 2},
                    {2, 2, 2},
                    {4, 3, 3}
                },
                {
                    {0, 1, 0},
                    {2, 0, 0},
                    {3, 0, 2},
                    {2, 1, 1},
                    {0, 0, 2}
                },
                {
                    {7, 4, 3},
                    {1, 2, 2},
                    {6, 0, 0},
                    {0, 1, 1},
                    {4, 3, 1}
                }
            };
            BankersResult b_res = run_bankers_safety(&b_in);
            printf("{\n");
            printf("  \"safe\": %s,\n", b_res.is_safe ? "true" : "false");
            printf("  \"sequence_length\": %d,\n", b_res.sequence_length);
            printf("  \"explanation\": \"%s\"\n", b_res.explanation);
            printf("}\n");
            return 0;
        }

        if (strcmp(dtype, "rag") == 0) {
            int alloc[MAX_D_PROCESSES][MAX_D_RESOURCES] = {
                {0, 1, 0},
                {0, 0, 1},
                {1, 0, 0}
            };
            int req[MAX_D_PROCESSES][MAX_D_RESOURCES] = {
                {1, 0, 0},
                {0, 1, 0},
                {0, 0, 1}
            };
            RAGResult rag_res = run_rag_cycle_detection(3, 3, alloc, req);
            printf("{\n");
            printf("  \"deadlock_detected\": %s,\n", rag_res.deadlock_detected ? "true" : "false");
            printf("  \"cycle_length\": %d,\n", rag_res.cycle_length);
            printf("  \"recommendation\": \"%s\"\n", rag_res.recovery_recommendation);
            printf("}\n");
            return 0;
        }
    }

    /* 4. FILESYSTEM & DIRECTORY BLOCKS */
    if (strcmp(cmd, "filesystem") == 0) {
        const char *ftype = (argc >= 3) ? argv[2] : "file_io";

        if (strcmp(ftype, "file_io") == 0) {
            FileIOResult fio = run_attendance_file_io_demo("STU1001", "CS401", "PRESENT");
            printf("{\n");
            printf("  \"step_count\": %d,\n", fio.step_count);
            printf("  \"steps\": [\n");
            for (int i = 0; i < fio.step_count; i++) {
                FileIODemoStep *s = &fio.steps[i];
                printf("    {\"syscall\": \"%s\", \"filepath\": \"%s\", \"explanation\": \"%s\"}%s\n",
                       s->syscall, s->filepath, s->explanation,
                       (i < fio.step_count - 1) ? "," : "");
            }
            printf("  ]\n");
            printf("}\n");
            return 0;
        }

        AllocationDemoResult ad = run_file_allocation_demo(ALLOC_CONTIGUOUS, "attendance_master.csv", 4, NULL);
        printf("{\n");
        printf("  \"method\": \"%s\",\n", ad.method_name);
        printf("  \"filename\": \"%s\",\n", ad.filename);
        printf("  \"assigned_count\": %d,\n", ad.assigned_count);
        printf("  \"blocks\": [");
        for (int i = 0; i < ad.assigned_count; i++) {
            printf("%d%s", ad.assigned_blocks[i], (i < ad.assigned_count - 1) ? ", " : "");
        }
        printf("]\n");
        printf("}\n");
        return 0;
    }

    /* 5. LOW-LEVEL SYSTEM CALLS WORKFLOW */
    if (strcmp(cmd, "syscalls") == 0) {
        SyscallTraceResult sw = trace_attendance_workflow_syscalls();
        printf("{\n");
        printf("  \"workflow\": \"%s\",\n", sw.workflow);
        printf("  \"total_calls\": %d,\n", sw.step_count);
        printf("  \"summary\": \"%s\",\n", sw.summary);
        printf("  \"calls\": [\n");
        for (int i = 0; i < sw.step_count; i++) {
            SyscallTraceStep *e = &sw.steps[i];
            printf("    {\"num\": %d, \"name\": \"%s\", \"args\": \"%s\", \"action\": \"%s\", \"return\": \"%s\"}%s\n",
                   e->syscall_number, e->call_name, e->arguments, e->kernel_action, e->return_value,
                   (i < sw.step_count - 1) ? "," : "");
        }
        printf("  ]\n");
        printf("}\n");
        return 0;
    }

    printf("{\"error\": \"Unknown command: %s\"}\n", cmd);
    return 1;
}
