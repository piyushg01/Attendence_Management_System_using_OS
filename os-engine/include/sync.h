#ifndef SYNC_H
#define SYNC_H

#include <stdbool.h>

#define MAX_SYNC_STEPS 64
#define BUFFER_SIZE 5

typedef struct {
    int step_number;
    char process_name[32];
    char action[64];
    int flag0;
    int flag1;
    int turn;
    char critical_section[32];
    char explanation[128];
} PetersonStep;

typedef struct {
    PetersonStep steps[MAX_SYNC_STEPS];
    int step_count;
    bool mutual_exclusion_held;
    bool progress_satisfied;
    bool bounded_waiting_satisfied;
} PetersonSimulation;

typedef struct {
    char actor[32];
    char operation[64];
    int resource_value_before;
    int resource_value_after;
    int lock_status; /* 0: unlocked, 1: locked */
    char status[32];
    char timestamp[32];
} SyncLogEntry;

typedef struct {
    char mode[32]; /* "unprotected" vs "semaphore_protected" */
    int final_record_value;
    int expected_value;
    bool race_condition_detected;
    SyncLogEntry logs[MAX_SYNC_STEPS];
    int log_count;
} ConcurrencyResult;

PetersonSimulation run_peterson_simulation(void);
ConcurrencyResult run_race_condition_demo(bool protect_with_semaphore);

#endif /* SYNC_H */
