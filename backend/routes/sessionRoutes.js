import express from "express";
import { 
    createSession, 
    deleteSession, 
    endSession, 
    getSessionById, 
    getSessions, 
    submitAnswer
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleAudio } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Apply auth protection to ALL routes in this file automatically
router.use(protect);

// 1. Root Routes ("/")
router.route("/")
    .get(getSessions)      // Fetch all sessions
    .post(createSession);  // Create new session

// 2. ID Routes ("/:id")
router.route("/:id")
    .get(getSessionById)   // View session details
    .delete(deleteSession); // Delete session

// 3. Action Routes
router.route("/:id/submit-answer").post(uploadSingleAudio, submitAnswer);
router.route("/:id/end").post(endSession);

export default router;