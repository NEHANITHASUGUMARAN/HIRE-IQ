import express from "express";
import multer from "multer";
import { analyzeResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Memory storage — we parse the buffer directly with pdf-parse, no disk writes needed
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are accepted"), false);
        }
    }
});

// POST /api/resume/analyze — accepts either a PDF upload OR raw resume_text body
router.post("/analyze", protect, upload.single("resumePdf"), analyzeResume);

export default router;
