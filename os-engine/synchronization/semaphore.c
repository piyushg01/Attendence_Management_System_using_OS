#include "../include/sync.h"
#include <stdio.h>
#include <string.h>

ConcurrencyResult run_race_condition_demo(bool protect_with_semaphore) {
    ConcurrencyResult res;
    memset(&res, 0, sizeof(ConcurrencyResult));

    strncpy(res.mode, protect_with_semaphore ? "semaphore_protected" : "unprotected", sizeof(res.mode) - 1);
    res.expected_value = 2; /* Two faculty members increment/update student 25 attendance count */

    int shared_attendance_counter = 0;
    int log_idx = 0;

    if (!protect_with_semaphore) {
        /* Unprotected interleaving showing race condition */
        res.race_condition_detected = true;

        /* Step 1: Faculty A reads shared counter */
        SyncLogEntry *e1 = &res.logs[log_idx++];
        strncpy(e1->actor, "Faculty A", sizeof(e1->actor) - 1);
        strncpy(e1->operation, "READ shared_counter (local_a = 0)", sizeof(e1->operation) - 1);
        e1->resource_value_before = 0;
        e1->resource_value_after = 0;
        e1->lock_status = 0;
        strncpy(e1->status, "CONTEXT_SWITCH_INTERRUPT", sizeof(e1->status) - 1);
        strncpy(e1->timestamp, "T0 + 0ms", sizeof(e1->timestamp) - 1);

        /* Step 2: Context switch to Faculty B who reads same value 0 */
        SyncLogEntry *e2 = &res.logs[log_idx++];
        strncpy(e2->actor, "Faculty B", sizeof(e2->actor) - 1);
        strncpy(e2->operation, "READ shared_counter (local_b = 0)", sizeof(e2->operation) - 1);
        e2->resource_value_before = 0;
        e2->resource_value_after = 0;
        e2->lock_status = 0;
        strncpy(e2->status, "RUNNING", sizeof(e2->status) - 1);
        strncpy(e2->timestamp, "T0 + 4ms", sizeof(e2->timestamp) - 1);

        /* Step 3: Faculty B increments and writes back 1 */
        shared_attendance_counter = 1;
        SyncLogEntry *e3 = &res.logs[log_idx++];
        strncpy(e3->actor, "Faculty B", sizeof(e3->actor) - 1);
        strncpy(e3->operation, "WRITE shared_counter = local_b + 1", sizeof(e3->operation) - 1);
        e3->resource_value_before = 0;
        e3->resource_value_after = shared_attendance_counter;
        e3->lock_status = 0;
        strncpy(e3->status, "OVERWRITE", sizeof(e3->status) - 1);
        strncpy(e3->timestamp, "T0 + 7ms", sizeof(e3->timestamp) - 1);

        /* Step 4: Faculty A resumes with stale local_a = 0, increments and writes 1 (losing Faculty B's write!) */
        shared_attendance_counter = 1;
        SyncLogEntry *e4 = &res.logs[log_idx++];
        strncpy(e4->actor, "Faculty A", sizeof(e4->actor) - 1);
        strncpy(e4->operation, "WRITE shared_counter = local_a + 1", sizeof(e4->operation) - 1);
        e4->resource_value_before = 1;
        e4->resource_value_after = shared_attendance_counter;
        e4->lock_status = 0;
        strncpy(e4->status, "LOST_UPDATE_CORRUPTED", sizeof(e4->status) - 1);
        strncpy(e4->timestamp, "T0 + 10ms", sizeof(e4->timestamp) - 1);

        res.final_record_value = shared_attendance_counter; /* Equals 1 instead of 2! */
        res.log_count = log_idx;
    } else {
        /* Protected by POSIX semaphore (sem_wait / sem_post) */
        res.race_condition_detected = false;

        /* Step 1: Faculty A calls sem_wait(&mutex) */
        SyncLogEntry *e1 = &res.logs[log_idx++];
        strncpy(e1->actor, "Faculty A", sizeof(e1->actor) - 1);
        strncpy(e1->operation, "sem_wait(&attendance_sem)", sizeof(e1->operation) - 1);
        e1->resource_value_before = shared_attendance_counter;
        e1->resource_value_after = shared_attendance_counter;
        e1->lock_status = 1;
        strncpy(e1->status, "LOCK_ACQUIRED", sizeof(e1->status) - 1);
        strncpy(e1->timestamp, "T0 + 0ms", sizeof(e1->timestamp) - 1);

        /* Step 2: Faculty A inside Critical Section updates counter */
        shared_attendance_counter++;
        SyncLogEntry *e2 = &res.logs[log_idx++];
        strncpy(e2->actor, "Faculty A", sizeof(e2->actor) - 1);
        strncpy(e2->operation, "CRITICAL SECTION: counter++", sizeof(e2->operation) - 1);
        e2->resource_value_before = 0;
        e2->resource_value_after = shared_attendance_counter;
        e2->lock_status = 1;
        strncpy(e2->status, "IN_CRITICAL_SECTION", sizeof(e2->status) - 1);
        strncpy(e2->timestamp, "T0 + 3ms", sizeof(e2->timestamp) - 1);

        /* Step 3: Faculty B attempts sem_wait, blocked in wait queue */
        SyncLogEntry *e3 = &res.logs[log_idx++];
        strncpy(e3->actor, "Faculty B", sizeof(e3->actor) - 1);
        strncpy(e3->operation, "sem_wait(&attendance_sem)", sizeof(e3->operation) - 1);
        e3->resource_value_before = shared_attendance_counter;
        e3->resource_value_after = shared_attendance_counter;
        e3->lock_status = 1;
        strncpy(e3->status, "BLOCKED_WAITING", sizeof(e3->status) - 1);
        strncpy(e3->timestamp, "T0 + 4ms", sizeof(e3->timestamp) - 1);

        /* Step 4: Faculty A calls sem_post(&mutex) */
        SyncLogEntry *e4 = &res.logs[log_idx++];
        strncpy(e4->actor, "Faculty A", sizeof(e4->actor) - 1);
        strncpy(e4->operation, "sem_post(&attendance_sem)", sizeof(e4->operation) - 1);
        e4->resource_value_before = shared_attendance_counter;
        e4->resource_value_after = shared_attendance_counter;
        e4->lock_status = 0;
        strncpy(e4->status, "LOCK_RELEASED_SIGNALED", sizeof(e4->status) - 1);
        strncpy(e4->timestamp, "T0 + 6ms", sizeof(e4->timestamp) - 1);

        /* Step 5: Faculty B unblocked and enters Critical Section */
        shared_attendance_counter++;
        SyncLogEntry *e5 = &res.logs[log_idx++];
        strncpy(e5->actor, "Faculty B", sizeof(e5->actor) - 1);
        strncpy(e5->operation, "CRITICAL SECTION: counter++", sizeof(e5->operation) - 1);
        e5->resource_value_before = 1;
        e5->resource_value_after = shared_attendance_counter;
        e5->lock_status = 1;
        strncpy(e5->status, "IN_CRITICAL_SECTION", sizeof(e5->status) - 1);
        strncpy(e5->timestamp, "T0 + 8ms", sizeof(e5->timestamp) - 1);

        /* Step 6: Faculty B calls sem_post(&mutex) */
        SyncLogEntry *e6 = &res.logs[log_idx++];
        strncpy(e6->actor, "Faculty B", sizeof(e6->actor) - 1);
        strncpy(e6->operation, "sem_post(&attendance_sem)", sizeof(e6->operation) - 1);
        e6->resource_value_before = shared_attendance_counter;
        e6->resource_value_after = shared_attendance_counter;
        e6->lock_status = 0;
        strncpy(e6->status, "COMPLETED_SAFE", sizeof(e6->status) - 1);
        strncpy(e6->timestamp, "T0 + 10ms", sizeof(e6->timestamp) - 1);

        res.final_record_value = shared_attendance_counter; /* Equals 2! Correct! */
        res.log_count = log_idx;
    }

    return res;
}
