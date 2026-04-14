import express from "express";
import { createJob, getJobs, getJobById, getRecruiterJobs, deleteJob } from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, createJob)
    .get(getJobs);

router.get("/recruiter/my-jobs", protect, getRecruiterJobs);

router.route("/:id")
    .get(getJobById)
    .delete(protect, deleteJob);

export default router;
