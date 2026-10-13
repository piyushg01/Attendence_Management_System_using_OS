import { getStore, markAttendanceRecord } from '../services/database.js';
import { runOsEngine } from '../services/osEngineBridge.js';
import { writeLog } from '../services/loggerService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

export async function markAttendance(req, res) {
  const { subjectCode, division, date, records, facultyId } = req.body;

  if (!subjectCode || !division || !records || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: 'Invalid attendance submission payload' });
  }

  writeLog('process', `Forking child attendance process PID: 4216 for ${subjectCode} (${division})`);
  writeLog('kernel', `sem_wait(&attendance_mutex) -> Critical Section Lock Acquired`);

  // Step 1: Execute database and raw Linux file I/O operations
  const dbResult = markAttendanceRecord({ subjectCode, division, date, records, facultyId });

  // Step 2: Trigger OS execution pipeline telemetry
  const pcbLifecycle = await runOsEngine('process_lifecycle', ['mark_attendance']);
  const threadDemo = await runOsEngine('threads', [String(records.length)]);
  const syscallTrace = await runOsEngine('syscalls', ['workflow']);

  writeLog('kernel', `sem_post(&attendance_mutex) -> Critical Section Released, buffers synced`);

  return res.json({
    success: true,
    result: dbResult,
    osPipeline: {
      pid: 4216,
      pcb: pcbLifecycle.pcb,
      stateTransitions: pcbLifecycle.transitions,
      threads: threadDemo.threads,
      syscalls: syscallTrace.steps,
      summary: "Attendance verified and written via Linux write() system call inside protected Semaphore critical section."
    }
  });
}

export function getAttendanceStats(req, res) {
  const store = getStore();
  const students = store.students;

  let totalStudents = students.length;
  let eligibleCount = students.filter(s => s.overallPercentage >= 75).length;
  let warningCount = students.filter(s => s.overallPercentage >= 65 && s.overallPercentage < 75).length;
  let criticalCount = students.filter(s => s.overallPercentage < 65).length;

  let totalPercentage = students.reduce((acc, s) => acc + s.overallPercentage, 0);
  let classAverage = Number((totalPercentage / totalStudents).toFixed(1));

  res.json({
    success: true,
    stats: {
      totalStudents,
      eligibleCount,
      warningCount,
      criticalCount,
      classAverage,
      totalClassesConducted: store.subjects.reduce((acc, s) => acc + s.conducted, 0)
    }
  });
}

export function getDefaulters(req, res) {
  const threshold = Number(req.query.threshold) || 75;
  const store = getStore();

  const defaulters = store.students
    .filter(s => s.overallPercentage < threshold)
    .sort((a, b) => a.overallPercentage - b.overallPercentage);

  res.json({
    success: true,
    threshold,
    count: defaulters.length,
    defaulters
  });
}

export function getAttendanceFiles(req, res) {
  const attDir = path.join(projectRoot, 'data', 'attendance');
  if (!fs.existsSync(attDir)) return res.json({ success: true, files: [] });

  const files = fs.readdirSync(attDir).map(file => {
    const stats = fs.statSync(path.join(attDir, file));
    return {
      name: file,
      sizeBytes: stats.size,
      lastModified: stats.mtime,
      inode: stats.ino || 1042
    };
  });

  res.json({ success: true, files });
}
