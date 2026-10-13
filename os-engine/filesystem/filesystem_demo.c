#include "../include/filesystem.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

AllocationDemoResult run_file_allocation_demo(AllocationMethod method, const char *filename, int blocks, FileSystemState *fs) {
    AllocationDemoResult res;
    memset(&res, 0, sizeof(AllocationDemoResult));

    strncpy(res.filename, filename ? filename : "attendance_oct.csv", sizeof(res.filename) - 1);
    res.requested_blocks = blocks > 0 ? blocks : 4;
    res.assigned_count = 0;
    res.index_block = -1;

    if (method == ALLOC_CONTIGUOUS) {
        strncpy(res.method_name, "Contiguous Allocation", sizeof(res.method_name) - 1);
        /* Find contiguous span of free blocks */
        int start = -1;
        int consecutive = 0;

        for (int i = 0; i < TOTAL_DISK_BLOCKS; i++) {
            if (fs->bitmap[i] == 0) {
                if (consecutive == 0) start = i;
                consecutive++;
                if (consecutive == res.requested_blocks) break;
            } else {
                consecutive = 0;
                start = -1;
            }
        }

        if (consecutive >= res.requested_blocks) {
            res.allocated_successfully = true;
            for (int k = 0; k < res.requested_blocks; k++) {
                int b = start + k;
                fs->bitmap[b] = 1;
                res.assigned_blocks[res.assigned_count++] = b;
            }
            snprintf(res.pointers_chain, sizeof(res.pointers_chain), 
                     "Contiguous Range: Start Block %d to Block %d (Length %d blocks)", 
                     start, start + res.requested_blocks - 1, res.requested_blocks);
            snprintf(res.explanation, sizeof(res.explanation), 
                     "Direct, fast sequential access. Minimal seek overhead; subject to external disk fragmentation.");
        } else {
            res.allocated_successfully = false;
            snprintf(res.explanation, sizeof(res.explanation), 
                     "Failed: Could not find %d consecutive contiguous free blocks on disk.", res.requested_blocks);
        }

    } else if (method == ALLOC_LINKED) {
        strncpy(res.method_name, "Linked Allocation", sizeof(res.method_name) - 1);
        int allocated = 0;
        char chain[256] = "";

        for (int i = 0; i < TOTAL_DISK_BLOCKS && allocated < res.requested_blocks; i++) {
            if (fs->bitmap[i] == 0) {
                fs->bitmap[i] = 1;
                res.assigned_blocks[allocated] = i;
                
                char node_str[32];
                snprintf(node_str, sizeof(node_str), "%sBlock[%d]", (allocated > 0) ? " -> " : "", i);
                strncat(chain, node_str, sizeof(chain) - strlen(chain) - 1);
                
                allocated++;
            }
        }

        if (allocated == res.requested_blocks) {
            res.allocated_successfully = true;
            res.assigned_count = allocated;
            strncpy(res.pointers_chain, chain, sizeof(res.pointers_chain) - 1);
            snprintf(res.explanation, sizeof(res.explanation), 
                     "No external fragmentation! Each disk block embeds a pointer to next sector. Random access is slow (O(N)).");
        } else {
            res.allocated_successfully = false;
            snprintf(res.explanation, sizeof(res.explanation), "Failed: Insufficient free blocks available on disk.");
        }

    } else if (method == ALLOC_INDEXED) {
        strncpy(res.method_name, "Indexed Allocation", sizeof(res.method_name) - 1);
        /* Need 1 block for Index Block + N blocks for data */
        int idx_block = -1;
        for (int i = 0; i < TOTAL_DISK_BLOCKS; i++) {
            if (fs->bitmap[i] == 0) {
                idx_block = i;
                fs->bitmap[i] = 1;
                break;
            }
        }

        if (idx_block != -1) {
            res.index_block = idx_block;
            int allocated = 0;
            char chain[256] = "";

            for (int i = 0; i < TOTAL_DISK_BLOCKS && allocated < res.requested_blocks; i++) {
                if (fs->bitmap[i] == 0) {
                    fs->bitmap[i] = 1;
                    res.assigned_blocks[allocated] = i;

                    char node_str[32];
                    snprintf(node_str, sizeof(node_str), "%sP[%d]=B#%d", (allocated > 0) ? ", " : "", allocated, i);
                    strncat(chain, node_str, sizeof(chain) - strlen(chain) - 1);
                    allocated++;
                }
            }

            if (allocated == res.requested_blocks) {
                res.allocated_successfully = true;
                res.assigned_count = allocated;
                snprintf(res.pointers_chain, sizeof(res.pointers_chain), "Index Block #%d contains pointers: [%s]", idx_block, chain);
                snprintf(res.explanation, sizeof(res.explanation), 
                         "Fast direct access to any block without external fragmentation. Index block overhead is minimal for medium files.");
            } else {
                res.allocated_successfully = false;
                snprintf(res.explanation, sizeof(res.explanation), "Failed: Insufficient data blocks available.");
            }
        } else {
            res.allocated_successfully = false;
            snprintf(res.explanation, sizeof(res.explanation), "Failed: No free block available for inode / Index block.");
        }
    }

    return res;
}

FreeSpaceResult inspect_free_space(const FileSystemState *fs) {
    FreeSpaceResult res;
    memset(&res, 0, sizeof(FreeSpaceResult));

    int free_c = 0;
    int alloc_c = 0;

    for (int i = 0; i < TOTAL_DISK_BLOCKS; i++) {
        res.bitmap[i] = fs->bitmap[i];
        if (fs->bitmap[i] == 0) {
            res.free_list[free_c++] = i;
        } else {
            alloc_c++;
        }
    }

    res.free_count = free_c;
    res.allocated_count = alloc_c;
    res.fragmentation_ratio = (TOTAL_DISK_BLOCKS > 0) ? ((double)alloc_c / TOTAL_DISK_BLOCKS) * 100.0 : 0.0;

    return res;
}

FileIOResult run_attendance_file_io_demo(const char *student_id, const char *subject, const char *status) {
    FileIOResult res;
    memset(&res, 0, sizeof(FileIOResult));

    if (!student_id) student_id = "STU1025";
    if (!subject) subject = "CS401-OS";
    if (!status) status = "PRESENT";

    int step_idx = 0;

    /* Step 1: open() syscall */
    FileIODemoStep *s1 = &res.steps[step_idx++];
    strncpy(s1->syscall, "open()", sizeof(s1->syscall) - 1);
    strncpy(s1->filepath, "data/attendance/october_2026.csv", sizeof(s1->filepath) - 1);
    s1->file_descriptor = 3;
    s1->bytes_transferred = 0;
    strncpy(s1->buffer_preview, "O_WRONLY | O_CREAT | O_APPEND (0644)", sizeof(s1->buffer_preview) - 1);
    strncpy(s1->status, "SUCCESS", sizeof(s1->status) - 1);
    strncpy(s1->explanation, "Kernel verifies permissions, locates inode in directory, allocates file descriptor fd=3 in PCB open file table.", sizeof(s1->explanation) - 1);

    /* Step 2: write() syscall */
    char write_buf[128];
    snprintf(write_buf, sizeof(write_buf), "%s,%s,%s,2026-10-08T10:30:00Z\n", student_id, subject, status);

    FileIODemoStep *s2 = &res.steps[step_idx++];
    strncpy(s2->syscall, "write()", sizeof(s2->syscall) - 1);
    strncpy(s2->filepath, "fd=3 (october_2026.csv)", sizeof(s2->filepath) - 1);
    s2->file_descriptor = 3;
    s2->bytes_transferred = (int)strlen(write_buf);
    strncpy(s2->buffer_preview, write_buf, sizeof(s2->buffer_preview) - 1);
    strncpy(s2->status, "SUCCESS", sizeof(s2->status) - 1);
    strncpy(s2->explanation, "Kernel page cache buffers byte stream, writes to disk sector blocks, advances file position pointer.", sizeof(s2->explanation) - 1);

    /* Step 3: fsync() syscall */
    FileIODemoStep *s3 = &res.steps[step_idx++];
    strncpy(s3->syscall, "fsync()", sizeof(s3->syscall) - 1);
    strncpy(s3->filepath, "fd=3", sizeof(s3->filepath) - 1);
    s3->file_descriptor = 3;
    s3->bytes_transferred = 0;
    strncpy(s3->buffer_preview, "FLUSH DIRTY BUFFERS", sizeof(s3->buffer_preview) - 1);
    strncpy(s3->status, "SUCCESS", sizeof(s3->status) - 1);
    strncpy(s3->explanation, "Forces physical write-out of kernel dirty page cache buffers to persistent storage disk blocks.", sizeof(s3->explanation) - 1);

    /* Step 4: close() syscall */
    FileIODemoStep *s4 = &res.steps[step_idx++];
    strncpy(s4->syscall, "close()", sizeof(s4->syscall) - 1);
    strncpy(s4->filepath, "fd=3", sizeof(s4->filepath) - 1);
    s4->file_descriptor = 3;
    s4->bytes_transferred = 0;
    strncpy(s4->buffer_preview, "DEALLOCATE_FD", sizeof(s4->buffer_preview) - 1);
    strncpy(s4->status, "SUCCESS", sizeof(s4->status) - 1);
    strncpy(s4->explanation, "Releases file descriptor 3 from process PCB file table, decrements file open count in inode.", sizeof(s4->explanation) - 1);

    res.step_count = step_idx;
    snprintf(res.final_file_content, sizeof(res.final_file_content), 
             "Student_ID,Subject,Status,Timestamp\n%s", write_buf);

    return res;
}
