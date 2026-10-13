import express from 'express';
import cors from 'cors';
import { initDatabase } from './src/services/database.js';
import { writeLog } from './src/services/loggerService.js';

import authRoutes from './src/routes/authRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import osRoutes from './src/routes/osRoutes.js';
import systemRoutes from './src/routes/systemRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/api/system/stats')) {
    writeLog('application', `${req.method} ${req.url}`);
  }
  next();
});

// Initialize database & directories
initDatabase();

// Mount API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/os', osRoutes);
app.use('/api/system', systemRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'OS-Based Attendance Management System API Bridge',
    time: new Date().toISOString(),
    osEngineBinary: 'ACTIVE'
  });
});

app.listen(PORT, () => {
  console.log(`[OS Backend Bridge] Server running on http://localhost:${PORT}`);
  writeLog('system', `OS Attendance Bridge Server started on port ${PORT}`);
});
