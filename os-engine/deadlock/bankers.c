#include "../include/deadlock.h"
#include <stdio.h>
#include <string.h>

BankersResult run_bankers_safety(const BankersInput *input) {
    BankersResult res;
    memset(&res, 0, sizeof(BankersResult));

    int n = input->num_processes;
    int m = input->num_resources;

    int work[MAX_D_RESOURCES];
    bool finish[MAX_D_PROCESSES] = {false};

    for (int j = 0; j < m; j++) {
        work[j] = input->available[j];
        res.work_matrix[0][j] = work[j];
    }

    /* Calculate Need if not provided */
    int need[MAX_D_PROCESSES][MAX_D_RESOURCES];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            need[i][j] = input->max[i][j] - input->allocation[i][j];
            if (need[i][j] < 0) need[i][j] = 0;
        }
    }

    int seq_idx = 0;
    while (seq_idx < n) {
        bool found = false;
        for (int i = 0; i < n; i++) {
            if (!finish[i]) {
                bool can_allocate = true;
                for (int j = 0; j < m; j++) {
                    if (need[i][j] > work[j]) {
                        can_allocate = false;
                        break;
                    }
                }

                if (can_allocate) {
                    for (int j = 0; j < m; j++) {
                        work[j] += input->allocation[i][j];
                        res.work_matrix[seq_idx + 1][j] = work[j];
                    }
                    res.safe_sequence[seq_idx++] = i;
                    finish[i] = true;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            /* Unsafe state */
            res.is_safe = false;
            res.sequence_length = 0;
            snprintf(res.explanation, sizeof(res.explanation), 
                     "System is in an UNSAFE state! Deadlock is possible. Cannot satisfy resource requirements for remaining processes.");
            return res;
        }
    }

    res.is_safe = true;
    res.sequence_length = n;
    
    char seq_str[128] = "";
    for (int i = 0; i < n; i++) {
        char buf[16];
        snprintf(buf, sizeof(buf), "%sP%d", (i > 0) ? " -> " : "", res.safe_sequence[i]);
        strncat(seq_str, buf, sizeof(seq_str) - strlen(seq_str) - 1);
    }

    snprintf(res.explanation, sizeof(res.explanation), 
             "System is in a SAFE state. Valid safe sequence found: <%s>. No deadlock can occur under these allocations.", seq_str);

    return res;
}

BankersResult run_bankers_request(const BankersInput *input, int process_id, const int *request) {
    BankersResult res;
    memset(&res, 0, sizeof(BankersResult));

    int m = input->num_resources;
    for (int j = 0; j < m; j++) {
        int need_j = input->max[process_id][j] - input->allocation[process_id][j];
        if (request[j] > need_j) {
            res.is_safe = false;
            snprintf(res.explanation, sizeof(res.explanation), 
                     "Error: Process P%d exceeded its declared maximum claim for resource R%d.", process_id, j);
            return res;
        }
        if (request[j] > input->available[j]) {
            res.is_safe = false;
            snprintf(res.explanation, sizeof(res.explanation), 
                     "Process P%d must wait. Requested resources are currently unavailable.", process_id);
            return res;
        }
    }

    /* Pretend to allocate and check safety */
    BankersInput temp = *input;
    for (int j = 0; j < m; j++) {
        temp.available[j] -= request[j];
        temp.allocation[process_id][j] += request[j];
    }

    return run_bankers_safety(&temp);
}
