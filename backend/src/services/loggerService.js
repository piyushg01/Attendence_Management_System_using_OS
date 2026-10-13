import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');
const logsDir = path.join(projectRoot, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function timestamp() {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

export function writeLog(category, message, pid = 4215) {
  const line = `[${timestamp()}] [PID:${pid}] [${category.toUpperCase()}] ${message}\n`;
  const appLog = path.join(logsDir, 'application.log');
  fs.appendFileSync(appLog, line);

  if (category === 'process') {
    fs.appendFileSync(path.join(logsDir, 'process.log'), line);
  } else if (category === 'attendance') {
    fs.appendFileSync(path.join(logsDir, 'attendance.log'), line);
  } else if (category === 'system' || category === 'kernel') {
    fs.appendFileSync(path.join(logsDir, 'system.log'), line);
  }
}

export function getLogs(category = 'application', limit = 100) {
  const target = path.join(logsDir, `${category}.log`);
  if (!fs.existsSync(target)) return [];
  const content = fs.readFileSync(target, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  return lines.slice(-limit).reverse();
}
