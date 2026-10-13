#ifndef DEADLOCK_H
#define DEADLOCK_H

#include <stdbool.h>

#define MAX_D_PROCESSES 10
#define MAX_D_RESOURCES 10

typedef struct {
    int num_processes;
    int num_resources;
    char process_names[MAX_D_PROCESSES][32];
    char resource_names[MAX_D_RESOURCES][32];
    int available[MAX_D_RESOURCES];
    int max[MAX_D_PROCESSES][MAX_D_RESOURCES];
    int allocation[MAX_D_PROCESSES][MAX_D_RESOURCES];
    int need[MAX_D_PROCESSES][MAX_D_RESOURCES];
} BankersInput;

typedef struct {
    bool is_safe;
    int safe_sequence[MAX_D_PROCESSES];
    int sequence_length;
    int work_matrix[MAX_D_PROCESSES + 1][MAX_D_RESOURCES];
    char explanation[512];
} BankersResult;

typedef struct {
    int from_node; /* 0..num_proc-1 is P, num_proc..num_proc+num_res-1 is R */
    int to_node;
    char type[16]; /* "request" (P->R) or "assignment" (R->P) */
} RAGEdge;

typedef struct {
    int num_processes;
    int num_resources;
    int edge_count;
    RAGEdge edges[64];
    bool deadlock_detected;
    int cycle_nodes[64];
    int cycle_length;
    char deadlocked_processes[MAX_D_PROCESSES][32];
    int deadlocked_count;
    char recovery_recommendation[256];
} RAGResult;

BankersResult run_bankers_safety(const BankersInput *input);
BankersResult run_bankers_request(const BankersInput *input, int process_id, const int *request);
RAGResult run_rag_cycle_detection(int num_processes, int num_resources, const int allocation[MAX_D_PROCESSES][MAX_D_RESOURCES], const int request[MAX_D_PROCESSES][MAX_D_RESOURCES]);

#endif /* DEADLOCK_H */
