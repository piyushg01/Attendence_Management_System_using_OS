import express from 'express';
import { getSystemStats, getSystemLogs } from '../controllers/systemController.js';

const router = express.Router();

router.get('/stats', getSystemStats);
router.get('/logs', getSystemLogs);

export default router;
