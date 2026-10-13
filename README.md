# AttendEase — College Attendance Management System

A web-based attendance management portal designed for college administration and academic faculties, powered by an underlying Operating System engine in C.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC):**
  - **College Administration:** Register faculties, assign one course across multiple divisions, upload master timetables, and audit records.
  - **Faculty Members:** View allotted lecture schedules, mark roll-call attendance with one-click toggles, and track course records.
- **Strict Authentication Lockdown:** Unauthorized users cannot enter or inspect internal pages without logging in.
- **Weekly Lecture Timetable Engine:** Conflict-free schedule allocation across Monday–Friday time slices (`09:30 AM`, `11:00 AM`, etc.).
- **Real-Time Defaulter Watchlist:** Automatically tracks students falling below the mandatory 75% attendance threshold (with Warning `<75%` and Critical `<65%` alerts).
- **Audit CSV Ledger Storage:** Real file-level session logs stored in `data/attendance/` for academic compliance.
- **OS Concepts Engine (C):** Demonstrates low-level file I/O system calls (`open`, `write`, `close`), CPU round-robin scheduling, mutual exclusion locks, and deadlock avoidance.

---

## 🔐 Default Credentials

### College Administration
- **Username / Email:** `administration@vit.edu`
- **Password:** `vit_college_pune`

### Faculty Members
- **Username / Email:** `facultyname@vit.edu` (e.g., `arvind.sharma@vit.edu`)
- **Password:** Assigned Course Code (e.g., `CS401`)

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Lucide Icons, Pure CSS Design System
- **Backend:** Node.js, Express, REST APIs
- **OS Engine:** C (GCC / MinGW), POSIX System Calls, Process & IPC Bridge
- **Storage:** Hierarchical CSV File Ledgers & JSON Persistence

---

## 🚀 How to Run the Project

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [GCC / MinGW](https://www.mingw-w64.org/) (for compiling the C engine)

### 2. Compile the C Engine
```bash
cd os-engine
gcc -O2 -Iinclude main_cli.c scheduling/fcfs.c scheduling/sjf.c scheduling/priority.c scheduling/round_robin.c process/pcb.c synchronization/semaphore.c synchronization/peterson.c deadlock/bankers.c deadlock/rag_detection.c filesystem/filesystem_demo.c syscalls/system_calls.c -o os_engine.exe
cd ..
```

### 3. Start Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 📁 Project Structure

```
Attendence_Management_System/
├── backend/                  # Express REST API server & database services
│   ├── src/
│   │   ├── controllers/      # Auth, attendance, student controllers
│   │   ├── routes/           # Express API route endpoints
│   │   └── services/         # File I/O, database persistence, OS bridge
│   └── server.js
├── frontend/                 # React Vite frontend application
│   └── src/
│       ├── components/       # Layout navbar & sidebar
│       ├── pages/            # Login, Dashboard, Attendance, Faculty
│       └── services/         # API fetch client
├── os-engine/                # Native C Operating System algorithm implementations
│   ├── deadlock/             # Banker's algorithm & RAG detection
│   ├── filesystem/           # File I/O & allocation simulations
│   ├── scheduling/           # Round Robin, FCFS, SJF, Priority
│   ├── synchronization/      # Peterson's algorithm & semaphores
│   ├── syscalls/             # Low-level system calls
│   └── main_cli.c            # Command-line driver for C engine
├── data/attendance/          # Real generated CSV session logs
└── scripts/                  # Automated build and run scripts
```
