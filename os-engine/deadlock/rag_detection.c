#include "../include/deadlock.h"
#include <stdio.h>
#include <string.h>

static bool dfs_cycle(int node, int total_nodes, const int adj[64][64], int visited[64], int path[64], int *cycle_buf, int *cycle_len) {
    visited[node] = 1; /* In current path */

    for (int next = 0; next < total_nodes; next++) {
        if (adj[node][next]) {
            if (visited[next] == 1) {
                /* Cycle found */
                cycle_buf[(*cycle_len)++] = next;
                cycle_buf[(*cycle_len)++] = node;
                return true;
            } else if (visited[next] == 0) {
                if (dfs_cycle(next, total_nodes, adj, visited, path, cycle_buf, cycle_len)) {
                    cycle_buf[(*cycle_len)++] = node;
                    return true;
                }
            }
        }
    }

    visited[node] = 2; /* Fully visited */
    return false;
}

RAGResult run_rag_cycle_detection(int num_processes, int num_resources, 
                                  const int allocation[MAX_D_PROCESSES][MAX_D_RESOURCES], 
                                  const int request[MAX_D_PROCESSES][MAX_D_RESOURCES]) {
    RAGResult res;
    memset(&res, 0, sizeof(RAGResult));

    res.num_processes = num_processes;
    res.num_resources = num_resources;

    int total_nodes = num_processes + num_resources;
    int adj[64][64] = {{0}};

    /* Process indices: 0 .. num_processes - 1
       Resource indices: num_processes .. num_processes + num_resources - 1 */
    int edge_idx = 0;

    /* Request edges: Process -> Resource */
    for (int p = 0; p < num_processes; p++) {
        for (int r = 0; r < num_resources; r++) {
            if (request[p][r] > 0) {
                int r_node = num_processes + r;
                adj[p][r_node] = 1;
                RAGEdge *e = &res.edges[edge_idx++];
                e->from_node = p;
                e->to_node = r_node;
                strncpy(e->type, "request", sizeof(e->type) - 1);
            }
        }
    }

    /* Assignment edges: Resource -> Process */
    for (int p = 0; p < num_processes; p++) {
        for (int r = 0; r < num_resources; r++) {
            if (allocation[p][r] > 0) {
                int r_node = num_processes + r;
                adj[r_node][p] = 1;
                RAGEdge *e = &res.edges[edge_idx++];
                e->from_node = r_node;
                e->to_node = p;
                strncpy(e->type, "assignment", sizeof(e->type) - 1);
            }
        }
    }
    res.edge_count = edge_idx;

    /* Cycle detection using DFS */
    int visited[64] = {0};
    int path[64] = {0};
    int cycle_buf[64] = {0};
    int cycle_len = 0;

    bool has_cycle = false;
    for (int i = 0; i < total_nodes; i++) {
        if (visited[i] == 0) {
            if (dfs_cycle(i, total_nodes, adj, visited, path, cycle_buf, &cycle_len)) {
                has_cycle = true;
                break;
            }
        }
    }

    res.deadlock_detected = has_cycle;
    res.cycle_length = cycle_len;

    if (has_cycle) {
        for (int i = 0; i < cycle_len; i++) {
            res.cycle_nodes[i] = cycle_buf[i];
            if (cycle_buf[i] < num_processes) {
                snprintf(res.deadlocked_processes[res.deadlocked_count++], 32, "P%d", cycle_buf[i]);
            }
        }
        strncpy(res.recovery_recommendation, 
                "DEADLOCK DETECTED! Circular wait condition active.\n"
                "Recommended Recovery: Abort youngest attendance worker process or preempt lock on shared attendance file.",
                sizeof(res.recovery_recommendation) - 1);
    } else {
        strncpy(res.recovery_recommendation, 
                "No cycles detected in Resource-Allocation Graph. System is free from deadlock.", 
                sizeof(res.recovery_recommendation) - 1);
    }

    return res;
}
