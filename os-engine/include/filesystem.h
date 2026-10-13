#ifndef FILESYSTEM_H
#define FILESYSTEM_H

#include <stdbool.h>

#define TOTAL_DISK_BLOCKS 64
#define MAX_FILES 16
#define MAX_BLOCKS_PER_FILE 16

typedef enum {
    ALLOC_CONTIGUOUS,
    ALLOC_LINKED,
    ALLOC_INDEXED
} AllocationMethod;

typedef struct {
    char filename[32];
    int size_kb;
    int block_count;
    AllocationMethod method;
    int start_block; /* Contiguous / Linked */
    int index_block; /* Indexed */
    int allocated_blocks[MAX_BLOCKS_PER_FILE];
} SimulatedFile;

typedef struct {
    int total_blocks;
    int free_blocks_count;
    int bitmap[TOTAL_DISK_BLOCKS]; /* 0 = Free, 1 = Allocated */
    SimulatedFile files[MAX_FILES];
    int file_count;
} FileSystemState;

typedef struct {
    char method_name[32];
    char filename[32];
    int requested_blocks;
    bool allocated_successfully;
    int assigned_blocks[MAX_BLOCKS_PER_FILE];
    int assigned_count;
    int index_block;
    char pointers_chain[256];
    char explanation[256];
} AllocationDemoResult;

typedef struct {
    int bitmap[TOTAL_DISK_BLOCKS];
    int free_list[TOTAL_DISK_BLOCKS];
    int free_count;
    int allocated_count;
    double fragmentation_ratio;
} FreeSpaceResult;

typedef struct {
    char syscall[32];
    char filepath[128];
    int file_descriptor;
    int bytes_transferred;
    char buffer_preview[128];
    char status[32];
    char explanation[128];
} FileIODemoStep;

typedef struct {
    FileIODemoStep steps[8];
    int step_count;
    char final_file_content[512];
} FileIOResult;

AllocationDemoResult run_file_allocation_demo(AllocationMethod method, const char *filename, int blocks, FileSystemState *fs);
FreeSpaceResult inspect_free_space(const FileSystemState *fs);
FileIOResult run_attendance_file_io_demo(const char *student_id, const char *subject, const char *status);

#endif /* FILESYSTEM_H */
