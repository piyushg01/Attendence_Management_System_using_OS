import express from 'express';
import {
  getScheduling,
  compareScheduling,
  getSyncDemo,
  getDeadlockDemo,
  getFilesystemDemo,
  getSyscallsDemo
} from '../controllers/osController.js';

const router = express.Router();

router.get('/scheduling', getScheduling);
router.get('/scheduling/compare', compareScheduling);
router.get('/sync', getSyncDemo);
router.get('/deadlock', getDeadlockDemo);
router.get('/filesystem', getFilesystemDemo);
router.get('/syscalls', getSyscallsDemo);

export default router;
