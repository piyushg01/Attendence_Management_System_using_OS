CC = gcc
CFLAGS = -Wall -Wextra -O2 -Iinclude

SRCS = main_cli.c \
       scheduling/fcfs.c \
       scheduling/sjf.c \
       scheduling/priority.c \
       scheduling/round_robin.c \
       process/pcb.c \
       synchronization/semaphore.c \
       synchronization/peterson.c \
       deadlock/bankers.c \
       deadlock/rag_detection.c \
       filesystem/filesystem_demo.c \
       syscalls/system_calls.c

TARGET = os_engine

all: $(TARGET)

$(TARGET): $(SRCS)
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET)

clean:
	rm -f $(TARGET) $(TARGET).exe *.o
