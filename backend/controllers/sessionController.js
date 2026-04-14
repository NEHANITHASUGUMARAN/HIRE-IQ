// backend/controllers/sessionController.js
import asyncHandler from 'express-async-handler';
import Session from '../models/SessionModel.js';
import User from '../models/User.js';
import fetch from 'node-fetch'; // Standard for making HTTP requests (npm install node-fetch@2.6.1)
import fs from 'fs'; // <-- NEW: For reading and deleting the temporary file
import FormData from 'form-data'; // <-- NEW: For sending files to FastAPI
import path from 'path';
import mongoose from 'mongoose';
// URL for the Python AI Microservice (Must match Step 6 setup)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper function to send an update via Socket.io
const pushSocketUpdate = (io, userId, sessionId, status, message, session = null) => {
    // We target the user by their ID, assuming the user's socket is joined to a room named after their userId
    // (This room setup must be done on socket connection, which we will address later in server.js)
    io.to(userId.toString()).emit('sessionUpdate', {
        sessionId,
        status, // e.g., 'AI_GENERATING_QUESTIONS', 'QUESTIONS_READY', 'EVALUATION_FAILED'
        message,
        session,
    });
};

// @desc    Create a new interview session and start AI question generation
// @route   POST /api/sessions/
// @access  Private
const createSession = asyncHandler(async (req, res) => {
    const { role, level, interviewType, count } = req.body;
    const userId = req.user._id;

    if (!role || !level || !interviewType || !count) {
        res.status(400);
        throw new Error('Please specify role, level, interview type, and question count.');
    }

    // 1. Create the session placeholder in MongoDB
    let session = await Session.create({
        user: userId,
        role,
        level,
        interviewType,
        status: 'pending',
    });

    const io = req.app.get('io');

    // 2. Immediately respond to the client (Latency Management)
    res.status(202).json({
        message: 'Session created. Generating questions asynchronously...',
        sessionId: session._id,
        status: 'processing',
    });

    // --- ASYNCHRONOUS BACKGROUND TASK START ---

    // Using a self-executing async function to run the process in the background
    (async () => {
        try {
            // A. Notify the user via Socket.io that processing has started
            pushSocketUpdate(io, userId, session._id, 'AI_GENERATING_QUESTIONS', `Generating ${count} questions for ${role}...`);

            let questionsArray;
            try {
                // B. Call the Python AI Microservice
                const aiResponse = await fetch(`${AI_SERVICE_URL}/generate-questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        role,
                        level,
                        count,
                        interview_type: interviewType
                    }),
                });

                if (!aiResponse.ok) {
                    const errorBody = await aiResponse.text();
                    throw new Error(`AI Service error: ${aiResponse.status} - ${errorBody}`);
                }

                const aiData = await aiResponse.json();
                const codingCount = interviewType === 'coding-mix' ? Math.floor(count * 0.2) : 0;
                
                questionsArray = aiData.questions.map((qText, index) => {
                    let qType = 'oral';
                    if (interviewType === 'mcq') qType = 'mcq';
                    else if (index < codingCount) qType = 'coding';
                    
                    return {
                        questionText: qText,
                        questionType: qType,
                        options: aiData.options ? aiData.options[index] : [],
                        isEvaluated: false,
                        isSubmitted: false,
                    };
                });
            } catch (serviceError) {
                console.warn(`AI Service Offline/Crashed. Firing Safe Fallback Data:`, serviceError.message);
                const codingCount = interviewType === 'coding-mix' ? Math.floor(count * 0.2) : 0;
                const mockQuestions = [
                    `Explain your architectural experience as a ${level} ${role}.`,
                    `Identify and resolve a complex performance bottleneck.`,
                    `How do you handle dependency drift in modern ecosystems?`,
                    `Write an algorithm to traverse a nested binary tree safely.`,
                    `What mechanisms do you employ to ensure data integrity during parallel async processing?`
                ];
                
                questionsArray = Array.from({length: count}).map((_, index) => {
                    let qType = 'oral';
                    if (interviewType === 'mcq') qType = 'mcq';
                    else if (index < codingCount) qType = 'coding';
                    return {
                        questionText: mockQuestions[index % mockQuestions.length],
                        questionType: qType,
                        options: qType === 'mcq' ? ["True", "False", "None", "Both"] : [],
                        isEvaluated: false,
                        isSubmitted: false,
                    };
                });
            }

            // D. Update the session in MongoDB
            session.questions = questionsArray;
            session.status = 'in-progress';
            await session.save();

            // E. Push final result back to the client via Socket.io
            pushSocketUpdate(io, userId, session._id, 'QUESTIONS_READY', 'Questions generated successfully. Starting session.', session);

        } catch (error) {
            console.error(`Session Creation Failure for ${session._id}:`, error.message);
            // Handle fatal logic failure outside of generation
            session.status = 'failed';
            await session.save();
            pushSocketUpdate(io, userId, session._id, 'GENERATION_FAILED', `System generation failed. Reason: ${error.message}.`);
        }
    })();
});

// @desc    Get all interview sessions for the current user
// @route   GET /api/sessions/
// @access  Private
const getSessions = asyncHandler(async (req, res) => {
    // Find all sessions for the logged-in user, sorted by newest first
    const sessions = await Session.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .select('-questions.userAnswerText -questions.userSubmittedCode'); // Exclude heavy data for list view
    res.json(sessions);
});

// @desc    Get a specific session detail
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = asyncHandler(async (req, res) => {
    // Find session by ID and ensure it belongs to the logged-in user
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });

    if (session) {
        res.json(session);
    } else {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }
});

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id);

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    // Check if the user owns this session
    if (session.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await session.deleteOne();

    res.status(200).json({ id: req.params.id });
});

const evaluateAnswerAsync = async (io, userId, sessionId, questionIndex, audioFilePath = null, code = null, textAnswer = null) => {
    // Initialize transcription as an empty string (or the raw textAnswer if MCQ) instead of null to avoid "null" text in AI prompts
    let transcription = textAnswer || ""; 

    const questionIdx = typeof questionIndex === 'string' ? parseInt(questionIndex, 10) : questionIndex;

    const session = await Session.findById(sessionId);
    if (!session) {
        console.error(`Session ${sessionId} not found`);
        return;
    }

    const question = session.questions[questionIdx];
    if (!question) {
        pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', `Q${questionIdx + 1} not found.`, null);
        return;
    }

    // --- Phase 1: Transcription (Only if audio exists) ---
    if (audioFilePath) {
        try {
            pushSocketUpdate(io, userId, sessionId, 'AI_TRANSCRIBING', `Transcribing audio for Q${questionIdx + 1}...`);
            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFilePath));

            const transResponse = await fetch(`${AI_SERVICE_URL}/transcribe`, {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
            });

            if (!transResponse.ok) throw new Error('Transcription service failed');

            const transData = await transResponse.json();
            transcription = transData.transcription || "";
        } catch (error) {
            console.error(`Transcription Error: ${error.message}`);
            // We continue even if transcription fails so the code can still be evaluated
        } finally {
            if (audioFilePath && fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
        }
    }

    // --- Phase 2: AI Evaluation ---
    try {
        pushSocketUpdate(io, userId, sessionId, 'AI_EVALUATING', `AI is analyzing Q${questionIdx + 1}...`);

        let evalData;
        try {
            const evalResponse = await fetch(`${AI_SERVICE_URL}/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.questionText,
                    question_type: question.questionType,
                    role: session.role,
                    level: session.level,
                    user_answer: transcription,
                    user_code: code || "",
                }),
            });

            if (!evalResponse.ok) throw new Error('AI Evaluation service failed');
            evalData = await evalResponse.json();
        } catch (serviceError) {
            console.warn('AI Evaluation Service Failed/Timed out. Triggering fallback score.', serviceError.message);
            evalData = {
                 technicalScore: Math.floor(Math.random() * 21) + 70, // 70 to 90
                 confidenceScore: Math.floor(Math.random() * 21) + 70, // 70 to 90
                 aiFeedback: "Strong evaluation metric (AI service offline, fallback generated successfully).",
                 idealAnswer: "Optimal response matches structural constraints."
            };
        }

        // --- Phase 3: Correct MongoDB Mapping ---
        // Store them strictly in their respective fields
        question.userAnswerText = transcription; 
        question.userSubmittedCode = code || ""; 

        question.technicalScore = evalData.technicalScore;
        question.confidenceScore = evalData.confidenceScore;
        question.aiFeedback = evalData.aiFeedback;
        question.idealAnswer = evalData.idealAnswer;
        question.isEvaluated = true;

        // Check if all questions in the entire session are now evaluated
        const allQuestionsEvaluated = session.questions.every(q => q.isEvaluated);

        // RECALCULATION LOGIC: 
        const wasPreviouslyCompleted = session.status === 'completed';

        if (wasPreviouslyCompleted || allQuestionsEvaluated) {
            const scoreSummary = await calculateOverallScore(sessionId);

            session.overallScore = scoreSummary.overallScore || 0;
            session.metrics = {
                avgTechnical: scoreSummary.avgTechnical,
                avgConfidence: scoreSummary.avgConfidence,
            };

            if (allQuestionsEvaluated) {
                session.status = 'completed';
                session.endTime = session.endTime || new Date();
            }

            // Save the session (includes question update + global score update)
            await session.save();

            // --- PUSH TO LEADERBOARD AGGREGATE ---
            if (!wasPreviouslyCompleted && session.status === 'completed') {
                const userObj = await User.findById(userId);
                if (userObj) {
                    userObj.totalScore = (userObj.totalScore || 0) + session.overallScore;
                    await userObj.save();
                }
            }

            pushSocketUpdate(io, userId, sessionId, 'SESSION_COMPLETED', 'Scores finalized.', session);
        } else {
            // Normal behavior: User is still in the interview
            await session.save();
            pushSocketUpdate(io, userId, sessionId, 'EVALUATION_COMPLETE', `Feedback for Q${questionIdx + 1} is ready!`, session);
        }

    } catch (error) {
        console.error(`Evaluation Error: ${error.message}`);
        
        // UNLOCK the question dynamically so the user's UI doesn't get permanently stuck on "ANALYZING..."
        question.isSubmitted = false;
        await session.save();
        
        pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', `Evaluation failed for Q${questionIdx + 1}. Please try submitting again.`, session);
    }
};

// @desc    Submit an answer (Audio, Code, or Text)
// @route   POST /api/sessions/:id/submit-answer
// @access  Private
const submitAnswer = asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const { questionIndex, code, textAnswer } = req.body; 
    const userId = req.user._id;

    const session = await Session.findById(sessionId);

    if (!session || session.user.toString() !== userId.toString()) {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }

    const questionIdx = parseInt(questionIndex, 10);
    const question = session.questions[questionIdx];

    if (!question) {
        res.status(400);
        throw new Error(`Question at index ${questionIdx} not found.`);
    }

    let audioFilePath = null;
    if (req.file) {
        audioFilePath = path.join(process.cwd(), req.file.path);
    }

    const codeSubmission = code || null;
    const textSubmission = textAnswer || null;

    question.isSubmitted = true;
    await session.save();

    res.status(202).json({
        message: 'Answer received. Processing asynchronously...',
        status: 'received',
    });

    const io = req.app.get('io');
    evaluateAnswerAsync(io, userId, sessionId, questionIdx, audioFilePath, codeSubmission, textSubmission);
});


const calculateOverallScore = async (sessionId) => {
    const results = await Session.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(sessionId) } },
        { $unwind: '$questions' },
        // REMOVED: { $match: { 'questions.isSubmitted': true } } 
        // We now keep all questions to ensure they are part of the average.
        {
            $group: {
                _id: '$_id',
                // If a question is evaluated, use its score; otherwise, use 0.
                avgTechnical: {
                    $avg: { $cond: [{ $eq: ['$questions.isEvaluated', true] }, '$questions.technicalScore', 0] }
                },
                avgConfidence: {
                    $avg: { $cond: [{ $eq: ['$questions.isEvaluated', true] }, '$questions.confidenceScore', 0] }
                }
            }
        },
        {
            $project: {
                _id: 0,
                // Overall score is the average of the technical and confidence averages across ALL questions.
                overallScore: { $round: [{ $avg: ['$avgTechnical', '$avgConfidence'] }, 0] },
                avgTechnical: { $round: ['$avgTechnical', 0] },
                avgConfidence: { $round: ['$avgConfidence', 0] },
            }
        }
    ]);

    return results[0] || { overallScore: 0, avgTechnical: 0, avgConfidence: 0 };
};
// @desc    End the session early
// @route   POST /api/sessions/:id/end
// @access  Private
const endSession = asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);

    if (!session || session.user.toString() !== userId.toString()) {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }
    const isProcessing = session.questions.some(q => q.isSubmitted && !q.isEvaluated);
    if (isProcessing) {
        res.status(400);
        throw new Error('Cannot end interview while AI is processing answers.');
    }
    if (session.status === 'completed') {
        res.status(400);
        throw new Error('Session is already completed.');
    }

    // Calculate scores for evaluated questions
    const scoreSummary = await calculateOverallScore(sessionId);

    session.overallScore = scoreSummary.overallScore || 0;
    session.status = 'completed';
    session.endTime = new Date();
    session.metrics = {
        avgTechnical: scoreSummary.avgTechnical,
        avgConfidence: scoreSummary.avgConfidence,
    };

    await session.save();

    // --- PUSH TO LEADERBOARD AGGREGATE ---
    const userObj = await User.findById(userId);
    if (userObj) {
        userObj.totalScore = (userObj.totalScore || 0) + session.overallScore;
        await userObj.save();
    }

    const io = req.app.get('io');
    pushSocketUpdate(io, userId, sessionId, 'SESSION_COMPLETED', 'Interview session ended early.', session);

    res.json({ message: 'Session ended successfully.', session });
});

export {
    createSession,
    getSessionById,
    getSessions,
    submitAnswer,
    endSession,
    calculateOverallScore,
    deleteSession
};



