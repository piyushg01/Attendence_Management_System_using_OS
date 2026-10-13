#ifndef SCHEDULING_H
#define SCHEDULING_H

#include "os_engine.h"

void run_fcfs(const PCB *input_procs, int count, SchedulingResult *result);
void run_sjf(const PCB *input_procs, int count, bool preemptive, SchedulingResult *result);
void run_priority(const PCB *input_procs, int count, bool preemptive, SchedulingResult *result);
void run_round_robin(const PCB *input_procs, int count, int quantum, SchedulingResult *result);

#endif /* SCHEDULING_H */
