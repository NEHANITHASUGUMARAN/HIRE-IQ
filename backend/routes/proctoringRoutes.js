import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    startProctoringSession,
    logViolation,
    getProctoringReport,
    endProctoringSession
} from '../controllers/proctoringController.js';

const router = express.Router();

router.post('/start', protect, startProctoringSession);
router.post('/violation', protect, logViolation);
router.post('/end', protect, endProctoringSession);
router.get('/report/:sessionId', protect, getProctoringReport);

export default router;
