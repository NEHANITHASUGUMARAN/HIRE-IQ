import express from "express";
import { createApplication, updateApplicationResult, getJobApplications, updateApplicationStatus, getMyApplications } from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:jobId", protect, createApplication);
router.put("/:id", protect, updateApplicationResult);
router.put("/:id/status", protect, updateApplicationStatus);
router.get("/me", protect, getMyApplications);
router.get("/job/:jobId", protect, getJobApplications);

export default router;
