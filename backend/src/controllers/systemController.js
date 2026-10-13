import os from 'os';
import { getLogs } from '../services/loggerService.js';
import { getStore } from '../services/database.js';

export function getSystemStats(req, res) {
  const store = getStore();

  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPct = Number(((usedMem / totalMem) * 100).toFixed(1));
  const uptimeHours = Number((os.uptime() / 3600).toFixed(2));

  // Linux simulated process table
  const processes = [
    { pid: 1, name: "systemd / init", ppid: 0, state: "SLEEPING", cpu: 0.1, mem_mb: 18.4, user: "root" },
    { pid: 4215, name: "attendance_daemon", ppid: 1, state: "RUNNING", cpu: 1.8, mem_mb: 48.2, user: "faculty_app" },
    { pid: 4216, name: "os_engine (C Worker)", ppid: 4215, state: "READY", cpu: 2.4, mem_mb: 12.8, user: "faculty_app" },
    { pid: 4217, name: "sqlite_logger", ppid: 4215, state: "SLEEPING", cpu: 0.4, mem_mb: 16.0, user: "faculty_app" },
    { pid: 4218, name: "defaulter_watchdog", ppid: 4215, state: "WAITING", cpu: 0.2, mem_mb: 8.5, user: "cron" }
  ];

  res.json({
    success: true,
    system: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpuModel: cpus[0] ? cpus[0].model : 'Multi-Core Processor',
      cpuCores: cpus.length,
      cpuLoadEstimatePct: Math.round(20 + Math.random() * 25),
      totalMemoryMb: Math.round(totalMem / (1024 * 1024)),
      usedMemoryMb: Math.round(usedMem / (1024 * 1024)),
      freeMemoryMb: Math.round(freeMem / (1024 * 1024)),
      memoryUtilizationPct: memPct,
      uptimeHours,
      activeAttendanceBatches: store.subjects.length,
      totalStudentsEnrolled: store.students.length,
      processes
    }
  });
}

export function getSystemLogs(req, res) {
  const { category = 'application', limit = 50 } = req.query;
  const logs = getLogs(category, Number(limit));
  res.json({ success: true, category, count: logs.length, logs });
}
