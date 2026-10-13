import express from 'express';
import { markAttendance, getAttendanceStats, getDefaulters, getAttendanceFiles } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/stats', getAttendanceStats);
router.get('/defaulters', getDefaulters);
router.get('/files', getAttendanceFiles);

export default router;
