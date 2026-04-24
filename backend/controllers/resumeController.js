import asyncHandler from "express-async-handler";
import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");


// @desc    Upload Resume PDF → extract text → send to AI Service for ATS analysis
// @route   POST /api/resume/analyze
// @access  Private (Student)
const analyzeResume = asyncHandler(async (req, res) => {
    const { job_role } = req.body;

    // ─── PDF Upload Mode ───────────────────────────────────────────
    let resume_text = "";

    if (req.file) {
        let parser;
        try {
            parser = new PDFParse({ data: req.file.buffer });
            const parsed = await parser.getText();
            resume_text = parsed.text;
        } catch (pdfErr) {
            console.error("PDF Parsing error:", pdfErr);
            res.status(400);
            throw new Error(`Failed to parse the uploaded PDF. Reason: ${pdfErr.message}`);
        } finally {
            if (parser) {
                await parser.destroy();
            }
        }
    } else if (req.body.resume_text) {
        resume_text = req.body.resume_text;
    } else {
        res.status(400);
        throw new Error("No resume provided. Please upload a PDF file or paste resume text.");
    }

    if (!resume_text || resume_text.trim().length < 50) {
        res.status(400);
        throw new Error("Extracted resume text is too short. Make sure the PDF is not scanned/image-only.");
    }

    try {
        const aiResponse = await axios.post(
            `${process.env.AI_SERVICE_URL}/analyze-resume`,
            {
                resume_text,
                job_role: job_role || "Software Developer"
            },
            { timeout: 120000 }
        );

        res.status(200).json({
            ...aiResponse.data,
            extractedText: resume_text.substring(0, 500) + (resume_text.length > 500 ? "..." : "")
        });
    } catch (error) {
        console.warn("AI Engine unavailable — using fallback mock response.");
        res.status(200).json({
            atsScore: 62,
            skillsFound: ["JavaScript", "React", "Node.js", "Python", "SQL"],
            missingSkills: ["Docker", "Kubernetes", "AWS", "TypeScript", "CI/CD"],
            improvements: [
                "Add quantifiable achievements (e.g., 'Reduced load time by 40%')",
                "Include a well-defined professional summary at the top",
                "List all cloud/DevOps tools you have used",
                "Add relevant certifications (AWS, GCP, Azure)"
            ],
            feedback: "Strong core stack detected but lacks cloud and DevOps experience. (Mock — AI server offline)",
            extractedText: resume_text.substring(0, 500) + (resume_text.length > 500 ? "..." : "")
        });
    }
});

export { analyzeResume };
