import asyncHandler from 'express-async-handler';
import ProctoringSession from '../models/ProctoringSession.js';

// Violation severity weights
const VIOLATION_WEIGHTS = {
    TAB_SWITCH: 10,
    COPY: 15,
    PASTE: 20,
    RIGHT_CLICK: 5,
    MULTIPLE_FACES: 30,
    NO_FACE: 15,
    EXIT_FULLSCREEN: 15,
    OUT_OF_BOUNDS: 15
};

// @desc    Start simple proctoring session
// @route   POST /api/proctoring/start
// @access  Private
export const startProctoringSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
        /* User might try to resume a session, so we can check if it already exists */
        res.status(400);
        throw new Error('Test Session ID is required');
    }

    let proctoringSession = await ProctoringSession.findOne({ user: userId, session: sessionId });

    if (proctoringSession) {
        // If already exists, return the existing tracking record.
        return res.status(200).json(proctoringSession);
    }

    proctoringSession = await ProctoringSession.create({
        user: userId,
        session: sessionId,
        violations: [],
        riskScore: 0,
        status: "active"
    });

    res.status(201).json(proctoringSession);
});

// @desc    Log a violation and update risk score
// @route   POST /api/proctoring/violation
// @access  Private
export const logViolation = asyncHandler(async (req, res) => {
    const { proctoringSessionId, type, metadata = "" } = req.body;

    if (!proctoringSessionId || !type) {
        res.status(400);
        throw new Error('Proctoring Session ID and violation type are required');
    }

    const proctoringSession = await ProctoringSession.findById(proctoringSessionId);

    if (!proctoringSession) {
        res.status(404);
        throw new Error('Proctoring session not found');
    }

    // Push new violation
    proctoringSession.violations.push({ type, metadata });

    // Recalculate Risk Score
    let totalScore = 0;
    proctoringSession.violations.forEach(v => {
        if (VIOLATION_WEIGHTS[v.type]) {
            totalScore += VIOLATION_WEIGHTS[v.type];
        }
    });

    // Normalize to 0-100 max boundary
    proctoringSession.riskScore = Math.min(totalScore, 100);

    await proctoringSession.save();

    res.status(200).json({
        message: 'Violation logged',
        riskScore: proctoringSession.riskScore,
        violationType: type
    });
});

// @desc    Get proctoring final report
// @route   GET /api/proctoring/report/:sessionId
// @access  Private (Admin or Owner)
export const getProctoringReport = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const proctoringSession = await ProctoringSession.findOne({ session: sessionId })
        .populate('user', 'name email');

    if (!proctoringSession) {
        res.status(404);
        throw new Error('Proctoring report not found for this session');
    }

    res.status(200).json(proctoringSession);
});

// @desc    End proctoring session
// @route   POST /api/proctoring/end
// @access  Private 
export const endProctoringSession = asyncHandler(async (req, res) => {
    const { proctoringSessionId } = req.body;

    const proctoringSession = await ProctoringSession.findById(proctoringSessionId);
    if (!proctoringSession) {
        res.status(404);
        throw new Error('Proctoring session not found');
    }

    proctoringSession.status = "completed";
    proctoringSession.endTime = Date.now();

    await proctoringSession.save();

    res.status(200).json({
        message: 'Proctoring session ended successfully',
        riskScore: proctoringSession.riskScore
    });
});
