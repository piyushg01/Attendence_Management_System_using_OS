#include "../include/sync.h"
#include <stdio.h>
#include <string.h>

PetersonSimulation run_peterson_simulation(void) {
    PetersonSimulation sim;
    memset(&sim, 0, sizeof(PetersonSimulation));

    sim.mutual_exclusion_held = true;
    sim.progress_satisfied = true;
    sim.bounded_waiting_satisfied = true;

    int idx = 0;
    int flag0 = 0, flag1 = 0, turn = 0;

    /* Step 1: Initial state */
    PetersonStep *s0 = &sim.steps[idx++];
    s0->step_number = 1;
    strncpy(s0->process_name, "System Init", sizeof(s0->process_name) - 1);
    strncpy(s0->action, "Initialize flags and turn", sizeof(s0->action) - 1);
    s0->flag0 = 0; s0->flag1 = 0; s0->turn = 0;
    strncpy(s0->critical_section, "EMPTY", sizeof(s0->critical_section) - 1);
    strncpy(s0->explanation, "Initial state: flag[0]=false, flag[1]=false, turn=0. Both processes in Remainder Section.", sizeof(s0->explanation) - 1);

    /* Step 2: P0 expresses interest */
    flag0 = 1;
    PetersonStep *s1 = &sim.steps[idx++];
    s1->step_number = 2;
    strncpy(s1->process_name, "Process P0 (Faculty A)", sizeof(s1->process_name) - 1);
    strncpy(s1->action, "flag[0] = true", sizeof(s1->action) - 1);
    s1->flag0 = flag0; s1->flag1 = flag1; s1->turn = turn;
    strncpy(s1->critical_section, "EMPTY", sizeof(s1->critical_section) - 1);
    strncpy(s1->explanation, "P0 sets flag[0]=true, signaling its desire to enter the critical section to update attendance.", sizeof(s1->explanation) - 1);

    /* Step 3: P0 yields priority to P1 */
    turn = 1;
    PetersonStep *s2 = &sim.steps[idx++];
    s2->step_number = 3;
    strncpy(s2->process_name, "Process P0 (Faculty A)", sizeof(s2->process_name) - 1);
    strncpy(s2->action, "turn = 1", sizeof(s2->action) - 1);
    s2->flag0 = flag0; s2->flag1 = flag1; s2->turn = turn;
    strncpy(s2->critical_section, "EMPTY", sizeof(s2->critical_section) - 1);
    strncpy(s2->explanation, "P0 politely sets turn=1, allowing P1 to enter first if it also wants to.", sizeof(s2->explanation) - 1);

    /* Step 4: P1 expresses interest */
    flag1 = 1;
    PetersonStep *s3 = &sim.steps[idx++];
    s3->step_number = 4;
    strncpy(s3->process_name, "Process P1 (Faculty B)", sizeof(s3->process_name) - 1);
    strncpy(s3->action, "flag[1] = true", sizeof(s3->action) - 1);
    s3->flag0 = flag0; s3->flag1 = flag1; s3->turn = turn;
    strncpy(s3->critical_section, "EMPTY", sizeof(s3->critical_section) - 1);
    strncpy(s3->explanation, "P1 sets flag[1]=true, also wanting to enter critical section.", sizeof(s3->explanation) - 1);

    /* Step 5: P1 sets turn = 0 */
    turn = 0;
    PetersonStep *s4 = &sim.steps[idx++];
    s4->step_number = 5;
    strncpy(s4->process_name, "Process P1 (Faculty B)", sizeof(s4->process_name) - 1);
    strncpy(s4->action, "turn = 0", sizeof(s4->action) - 1);
    s4->flag0 = flag0; s4->flag1 = flag1; s4->turn = turn;
    strncpy(s4->critical_section, "EMPTY", sizeof(s4->critical_section) - 1);
    strncpy(s4->explanation, "P1 sets turn=0. Now turn holds value 0 (overwrote P0's previous turn=1).", sizeof(s4->explanation) - 1);

    /* Step 6: P1 evaluates condition (flag[0] && turn == 0) -> true! P1 busy waits */
    PetersonStep *s5 = &sim.steps[idx++];
    s5->step_number = 6;
    strncpy(s5->process_name, "Process P1 (Faculty B)", sizeof(s5->process_name) - 1);
    strncpy(s5->action, "while(flag[0] && turn == 0) -> BLOCKED", sizeof(s5->action) - 1);
    s5->flag0 = flag0; s5->flag1 = flag1; s5->turn = turn;
    strncpy(s5->critical_section, "EMPTY", sizeof(s5->critical_section) - 1);
    strncpy(s5->explanation, "P1 evaluates loop condition: flag[0]=true and turn=0 is TRUE. P1 busy-waits.", sizeof(s5->explanation) - 1);

    /* Step 7: P0 evaluates condition (flag[1] && turn == 1) -> false (because turn == 0)! P0 enters CS */
    PetersonStep *s6 = &sim.steps[idx++];
    s6->step_number = 7;
    strncpy(s6->process_name, "Process P0 (Faculty A)", sizeof(s6->process_name) - 1);
    strncpy(s6->action, "Enters CRITICAL SECTION", sizeof(s6->action) - 1);
    s6->flag0 = flag0; s6->flag1 = flag1; s6->turn = turn;
    strncpy(s6->critical_section, "P0 (Faculty A)", sizeof(s6->critical_section) - 1);
    strncpy(s6->explanation, "P0 evaluates loop condition: turn == 1 is FALSE. P0 enters Critical Section and updates student attendance.", sizeof(s6->explanation) - 1);

    /* Step 8: P0 exits and sets flag[0] = false */
    flag0 = 0;
    PetersonStep *s7 = &sim.steps[idx++];
    s7->step_number = 8;
    strncpy(s7->process_name, "Process P0 (Faculty A)", sizeof(s7->process_name) - 1);
    strncpy(s7->action, "flag[0] = false (Exit Section)", sizeof(s7->action) - 1);
    s7->flag0 = flag0; s7->flag1 = flag1; s7->turn = turn;
    strncpy(s7->critical_section, "EMPTY", sizeof(s7->critical_section) - 1);
    strncpy(s7->explanation, "P0 finishes update and sets flag[0]=false. P0 moves to Remainder Section.", sizeof(s7->explanation) - 1);

    /* Step 9: P1 loop condition becomes false! P1 enters CS */
    PetersonStep *s8 = &sim.steps[idx++];
    s8->step_number = 9;
    strncpy(s8->process_name, "Process P1 (Faculty B)", sizeof(s8->process_name) - 1);
    strncpy(s8->action, "Enters CRITICAL SECTION", sizeof(s8->action) - 1);
    s8->flag0 = flag0; s8->flag1 = flag1; s8->turn = turn;
    strncpy(s8->critical_section, "P1 (Faculty B)", sizeof(s8->critical_section) - 1);
    strncpy(s8->explanation, "P1's condition flag[0] is now FALSE! P1 breaks out of wait and safely enters Critical Section.", sizeof(s8->explanation) - 1);

    /* Step 10: P1 exits and sets flag[1] = false */
    flag1 = 0;
    PetersonStep *s9 = &sim.steps[idx++];
    s9->step_number = 10;
    strncpy(s9->process_name, "Process P1 (Faculty B)", sizeof(s9->process_name) - 1);
    strncpy(s9->action, "flag[1] = false (Exit Section)", sizeof(s9->action) - 1);
    s9->flag0 = flag0; s9->flag1 = flag1; s9->turn = turn;
    strncpy(s9->critical_section, "EMPTY", sizeof(s9->critical_section) - 1);
    strncpy(s9->explanation, "P1 finishes update and resets flag[1]=false. Mutual exclusion perfectly preserved throughout!", sizeof(s9->explanation) - 1);

    sim.step_count = idx;
    return sim;
}
