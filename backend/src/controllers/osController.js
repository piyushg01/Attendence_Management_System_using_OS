import { runOsEngine } from '../services/osEngineBridge.js';

export async function getScheduling(req, res) {
  const { algo = 'fcfs', quantum = 3 } = req.query;
  const result = await runOsEngine('schedule', [algo, String(quantum)]);
  res.json({ success: true, result });
}

export async function compareScheduling(req, res) {
  const result = await runOsEngine('compare_scheduling', []);
  res.json({ success: true, result });
}

export async function getSyncDemo(req, res) {
  const { type = 'peterson' } = req.query;
  const result = await runOsEngine('sync', [type]);
  res.json({ success: true, result });
}

export async function getDeadlockDemo(req, res) {
  const { type = 'bankers' } = req.query;
  const result = await runOsEngine('deadlock', [type]);
  res.json({ success: true, result });
}

export async function getFilesystemDemo(req, res) {
  const { type = 'file_io' } = req.query;
  const result = await runOsEngine('filesystem', [type]);
  res.json({ success: true, result });
}

export async function getSyscallsDemo(req, res) {
  const result = await runOsEngine('syscalls', ['workflow']);
  res.json({ success: true, result });
}
